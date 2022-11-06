import fetch from 'node-fetch';
import moment from 'moment';
import PushApi from './api/PushApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    {
        // 冰糖
        url: 'https://api.bilibili.com/x/series/archives?mid=198297&series_id=210350&only_normal=true&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        path: `星律动/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `四禧丸子/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `sp9/凜凜蝶凜/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `ASOUL/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `EOE组合/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `量子少年/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: `sp9/明前奶绿/${moment().format('YYYY.MM')}`,
        mode: 2
    }
];

(async () => {
    for (let i = 0; i < archives.length; ++i) {
        const archive = archives[i];
        if (archive.mode === 1) {
            // 获取B站源
            let video = {};
            try {
                const res = await fetch(archive.url);  // 请求合集列表
                const json = await res.json();
                video = json.data.archives[0];
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex.response.data);
                continue;
            }
            console.log(video.title, video.bvid);
            try {
                // 下载视频
                try {
                    await DiskApi.saveByBv(video.bvid);
                } catch (ex) {
                    console.log(ex);
                    PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                    continue;
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`查询bv(${video.bvid})的clip失败`, ex.response.data);
                continue;
            }
        } else if (archive.mode === 2) {
            // 需要下载今天和昨天的视频
            const today = moment().format('YYYYMMDD');
            const yesterday = moment().subtract(1, 'days').format('YYYYMMDD');
            // 获取录播站源
            const url = 'https://bili.lubo.media/api/fs/list';
            const params = {
                page: 1,
                password: '',
                path: `/${archive.path}`,
                per_page: 10,
                refresh: false
            };
            try {
                console.log(params);
                const res = await fetch(url, {
                    method: 'post',
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const json = await res.json();
                const files = json.data.content.filter(file => !file.is_dir && file.type === 2 && file.size > 0);
                for (let i = 0; i < files.length; ++i) {
                    const file = files[i];
                    if (!file.name.startsWith(today) && !file.name.startsWith(yesterday)) {
                        continue;
                    }
                    console.log(file);     
                    const downloadUrl = `https://bili.lubo.media/d/${archive.path}/${file.name}`;
                    // 下载视频
                    try {
                        await DiskApi.saveByUrl(downloadUrl);
                    } catch (ex) {
                        console.log(ex);
                        PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                        continue;
                    }
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex.response.data);
                continue;
            }
        }
    }
})();
