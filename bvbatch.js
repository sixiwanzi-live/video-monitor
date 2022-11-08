import fetch from 'node-fetch';
import PushApi from './api/PushApi.js';
import DiskApi from './api/DiskApi.js';

(async () => {
    try {
        const res1 = await fetch('https://api.bilibili.com/x/series/archives?mid=1563329562&series_id=2605708&only_normal=true&sort=desc&pn=1&ps=300');  // 请求合集列表
        const archives = (await res1.json()).data.archives;
        for (let i = 0; i < archives.length; ++i) {
            const archive = archives[i];

            let title   = archive.title;
            const bvid  = archive.bvid;
            console.log(`${title},${bvid}`);

            // 新增clip
            try {
                const res2 = await DiskApi.saveByBv(bvid);
            } catch (ex) {
                console.log(ex);
                console.log(`faile:${title},${bvid}`);
                continue;
            }
        }
    } catch (ex) {
        console.log(ex);
    }
})();
