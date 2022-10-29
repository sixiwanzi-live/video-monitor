import exec from 'child_process';
import axios from 'axios';
import moment from 'moment';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

(async () => {
    try {
        const res1 = await axios.get('https://api.bilibili.com/x/series/archives?mid=672342685&series_id=222754&only_normal=true&sort=desc&pn=1&ps=300');  // 请求合集列表
        const archives = res1.data.data.archives;
        for (let i = 0; i < archives.length; ++i) {
            const archive = archives[i];

            let title   = archive.title;
            const bvid  = archive.bvid;
            const pic   = archive.pic;
            console.log(`${title},${bvid},${pic}`);

            // 获取直播时间
            const pubdate = title.substring(title.lastIndexOf(' '), title.length);
            const datetime = moment(pubdate, 'YYYY年M月D日H点场').format('YYYY-MM-DD HH:mm:ss');
            console.log(`直播时间:${datetime}`);

            // 修正标题
            title = title.replaceAll('【直播回放】', '');
            title = title.substring(0, title.lastIndexOf(' '));
            console.log(`标题:${title}`);

            const cover = pic.substring(7);
            console.log(`封面:${cover}`);

            try {
                // 下载视频
                try {
                    await DiskApi.saveByBv(bvid);
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
        }
    } catch (ex) {
        console.log(ex.response.data);
        PushApi.push(`请求author(${authorId})的合集列表失败`, ex.response.data);
    }
})();
