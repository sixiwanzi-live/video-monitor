import axios from 'axios';
import PushApi from './api/PushApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    // {
    //     path: '四禧丸子',
    //     mode: 2
    // },
    {
        // 恬豆
        url: "https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2326892&sort=desc&pn=1&ps=1",
        mode: 1
    },
    {
        // 梨安
        url: "https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2326869&sort=desc&pn=1&ps=1",
        mode: 1
    },
    {
        // 沐霂
        url: 'https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2605708&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 又一
        url: 'https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2326888&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        //四喜丸子
        url: 'https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2328858&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 冰糖
        url: 'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=71413901&season_id=309045&sort_reverse=false&page_num=1&page_size=1',
        mode: 1
    },
    {
        // 唐九夏2D
        url: 'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=1981879400&season_id=613261&sort_reverse=true&page_num=1&page_size=1',
        mode: 1
    },
    {
        // 唐九夏3D
        url: 'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=1981879400&season_id=610698&sort_reverse=true&page_num=1&page_size=1',
        mode: 1
    },
    {
        // kino
        url: 'https://api.bilibili.com/x/series/archives?mid=1383815813&series_id=2060096&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 卡缇娅
        url: 'https://api.bilibili.com/x/series/archives?mid=1011797664&series_id=2302706&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 麻尤米
        url: 'https://api.bilibili.com/x/series/archives?mid=338283235&series_id=2505048&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        path: '凜凜蝶凜',
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
        path: '明前奶绿',
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
            const url = `https://bili-rec.com/api/public/path`;
            const params = {
                path: `/${archive.path}`,
                password: '',
                page_num: 1,
                page_size: 10
            };
            try {
                const res = await axios.post(url, params);
                const file = res.data.data.files.filter(file => file.type === 3).at(0);
                console.log(file);
                if (file.size <= 0) {
                    continue;
                }
                
                const downloadUrl = `https://bili-rec.com/d/${archive.path}/${file.name}`;
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
