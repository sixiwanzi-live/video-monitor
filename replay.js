import axios from 'axios';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    'https://api.bilibili.com/x/series/archives?mid=338283235&series_id=2505048&sort=desc&pn=1&ps=1'
];
(async () => {
    for (let i = 0; i < archives.length; ++i) {
        let video = {};
        try {
            if (archives[i].indexOf('search') !== -1) {
                const res = await axios.get(archives[i]);  // 请求合集列表
                video = res.data.data.list.vlist[0];
            } else if (archives[i].indexOf('series') !== -1) {
                const res = await axios.get(archives[i]);  // 请求合集列表
                video = res.data.data.archives[0];
            }
        } catch (ex) {
            console.log(ex);
            PushApi.push(`请求回放列表失败`, ex.response.data);
            continue;
        }

        console.log(video.title, video.bvid);

        try {
            const res2 = await ZimuApi.findClipsByBv(video.bvid);  // 查询请求到的bv号是否已经在库中
            if (res2.data.id) {
                continue;
            }

            await PushApi.push(`[发现新视频] ${video.title}`, `bv:${video.bvid}`);
            
            // 下载视频
            try {
                await DiskApi.save(video.bvid);
            } catch (ex) {
                console.log(ex);
                PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                continue;
            }
        } catch (ex) {
            console.log(ex);
            PushApi.push(`查询bv(${bv})的clip失败`, ex.response.data);
            continue;
        }
    }
})();
