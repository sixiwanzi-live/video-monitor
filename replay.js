import axios from 'axios';
import PushApi from './api/PushApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    {
        path: '四禧丸子',
        mode: 2
    },
    {
        // 慕宇
        url: 'https://api.bilibili.com/x/series/archives?mid=1230039261&series_id=2223855&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 楚风
        url: 'https://api.bilibili.com/x/series/archives?mid=1757836012&series_id=2202072&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 冰糖
        url: 'https://api.bilibili.com/x/series/archives?mid=198297&series_id=210350&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 莞儿
        url: 'https://api.bilibili.com/x/series/archives?mid=1875044092&series_id=2508539&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 露早
        url: 'https://api.bilibili.com/x/series/archives?mid=1669777785&series_id=2519501&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 米诺
        url: 'https://api.bilibili.com/x/series/archives?mid=1778026586&series_id=2513879&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 柚恩
        url: 'https://api.bilibili.com/x/series/archives?mid=1795147802&series_id=2516609&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 虞莫
        url: 'https://api.bilibili.com/x/series/archives?mid=1811071010&series_id=2522257&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 明前奶绿
        url: 'https://api.bilibili.com/x/series/archives?mid=2132180406&series_id=2484684&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 唐九夏
        url: 'https://api.bilibili.com/x/series/archives?mid=1219196749&series_id=2065795&sort=desc&pn=1&ps=1',
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
        // 翔太
        url: 'https://api.bilibili.com/x/series/archives?mid=1461176910&series_id=2208174&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 泽一
        url: 'https://api.bilibili.com/x/series/archives?mid=1535525542&series_id=2205073&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 麻尤米
        url: 'https://api.bilibili.com/x/series/archives?mid=338283235&series_id=2505048&sort=desc&pn=1&ps=1',
        mode: 1
    }
];

(async () => {
    for (let i = 0; i < archives.length; ++i) {
        const archive = archives[i];
        if (archive.mode === 1) {
            let video = {};
            try {
                if (archive.url.indexOf('search') !== -1) {
                    const res = await axios.get(archive.url);  // 请求合集列表
                    video = res.data.data.list.vlist[0];
                } else if (archive.url.indexOf('series') !== -1) {
                    const res = await axios.get(archive.url);  // 请求合集列表
                    video = res.data.data.archives[0];
                }
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
            const url = `https://sxwz-rec.com/api/public/path`;
            const params = {
                path: `/${archive.path}`,
                password: '',
                page_num: 1,
                page_size: 1000
            };
            try {
                const res = await axios.post(url, params);
                const file = res.data.data.files.filter(file => file.type === 3).at(-1);
                console.log(file);
                if (file.size <= 0) {
                    continue;
                }
                
                const downloadUrl = `https://sxwz-rec.com/d/${archive.path}/${file.name}`;
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
