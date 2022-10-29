import axios from 'axios';
import moment from 'moment';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

(async () => {
    const authorId = 20;
    try {
        const res1 = await axios.get('https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=7262655&season_id=501913&sort_reverse=false&page_num=1&page_size=100');  // 请求合集列表
        const archives = res1.data.data.archives;
        for (let i = 0; i < archives.length; ++i) {
            const archive = archives[i];

            let title   = archive.title;
            const bvid  = archive.bvid;
            const pic   = archive.pic;
            console.log(`${title},${bvid},${pic}`);

            title = title.replaceAll('【麻尤米录播】', '');
            // 获取直播时间
            const pubdate = title.match(/^\d+\.\d+/)[0];
            console.log(pubdate);
            const datetime = moment(pubdate, 'MM.DD').format('YYYY-MM-DD HH:mm:ss');
            console.log(`直播时间:${datetime}`);

            // 修正标题
            title = title.substring(title.indexOf(' '), title.length);
            console.log(`标题:${title}`);

            const cover = pic.substring(7);
            console.log(`封面:${cover}`);

            // 新增clip
            try {
                const res2 = await ZimuApi.insertClip({
                    authorId: authorId,
                    title: title,
                    datetime: datetime,
                    bv: bvid,
                    cover: cover
                });
                PushApi.push(`新增"${title}"clip成功`, `authorId:${authorId},title:${title},datetime:${datetime},bv:${bvid}`);
            } catch (ex) {
                console.log(ex.response.data);
                PushApi.push(`新增"${title}"clip失败`, ex.response.data);
                continue;
            }

            // 下载视频
            try {
                await DiskApi.save(bvid);
            } catch (ex) {
                console.log(ex.response.data);
                PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                continue;
            }
        }
    } catch (ex) {
        console.log(ex.response.data);
        PushApi.push(`请求author(${authorId})的合集列表失败`, ex.response.data);
    }
})();
