import axios from 'axios';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    {
        url: 'https://api.bilibili.com/x/series/archives?mid=338283235&series_id=2505048&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        path: '四禧丸子',
        mode: 2
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
                下载视频
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
