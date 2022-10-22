import axios from 'axios';
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
        path: '星律动',
        mode: 2
    },
    {
        path: `四禧丸子/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        path: 'sp9/凜凜蝶凜',
        mode: 2
    },
    {
        path: 'ASOUL',
        mode: 2
    },
    {
        path: 'EOE组合',
        mode: 2
    },
    {
        path: '量子少年',
        mode: 2
    },
    {
        path: 'sp9/明前奶绿',
        mode: 2
    },
    {
        path: `sp7/麻尤米mayumi/${moment().format('YYYY.MM')}`,
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
                const res = await axios.get(archive.url);  // 请求合集列表
                video = res.data.data.archives[0];
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
                const res = await axios.post(url, params);
                const file = res.data.data.content.filter(file => !file.is_dir && file.type === 2 && file.size > 0).at(0);
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
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex.response.data);
                continue;
            }
        }
    }
})();
