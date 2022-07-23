import exec from 'child_process';
import axios from 'axios';
import moment from 'moment';
import config from './config.js';
import archives from './archives.js';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

(async () => {
    for (let i = 0; i < archives.length; ++i) {
        const authorId = archives[i].id;
        let video = {};
        try {
            const res1 = await axios.get(archives[i].url);  // 请求合集列表
            video = res1.data.data.archives[0];             // 获取合集中最新的视频
        } catch (ex) {
            console.log(ex);
            PushApi.push(`请求author(${authorId})的合集列表失败`, ex.response.data);
            continue;
        }

        let title   = video.title;
        const bvid  = video.bvid;
        const pic   = video.pic;

        try {
            const res2 = await ZimuApi.findLatestClipByAuthorId(authorId);  // 请求字幕库中的最新视频
            if (res2.data.bv === bvid) {
                // continue;
            }
            await PushApi.push(`[发现新视频] ${title}`, `bv:${bvid},authorId:${authorId}`);

            // 获取直播时间
            const pubdate = title.substring(title.lastIndexOf(' '), title.length);
            const datetime = moment(pubdate, 'YYYY年M月D日H点场').format('YYYY-MM-DD HH:mm:ss');
            console.log(`直播时间:${datetime}`);

            // 修正标题
            title = title.replaceAll('【直播回放】', '');
            title = title.substring(0, title.lastIndexOf(' '));
            console.log(`标题:${title}`);

            // 下载封面图
            const cmd1 = `wget ${pic} -O ${config.tmp.path}/${bvid}.jpg`;
            console.log(`下载封面图命令:${cmd1}`);
            try {
                await new Promise((res, rej) => {
                    exec.exec(cmd1, (error, stdout, stderr) => {
                        if (error) {
                            rej(error);
                        } else {
                            console.log(stdout);
                            console.log(stderr);
                        }                
                        res();
                    });
                });
            } catch (ex) {
                console.log(ex);
                PushApi.push(`下载"${title}"封面图失败`, ex.response.data);
                continue;
            }

            let filename = '';
            // 上传封面图
            try {
                const res1 = await ZimuApi.upload(`${config.tmp.path}/${bvid}.jpg`);
                filename = res1.filename;
            } catch (ex) {
                console.log(ex);
                PushApi.push(`上传"${title}"封面图失败`, ex);
                continue;
            }
            
            // 新增clip
            try {
                const res2 = await ZimuApi.insertClip({
                    authorId: authorId,
                    title: title,
                    datetime: datetime,
                    bv: bvid,
                    filename: filename
                });
                PushApi.push(`新增"${title}"clip成功`, `authorId:${authorId},title:${title},datetime:${datetime},bv:${bvid}`);
            } catch (ex) {
                console.log(ex);
                PushApi.push(`新增"${title}"clip失败`, ex.response.data);
                continue;
            }
            
            // 下载视频
            try {
                await DiskApi.save(bvid);
            } catch (ex) {
                console.log(ex);
                PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                continue;
            }
        } catch (ex) {
            console.log(ex);
            PushApi.push(`请求author(${authorId})的字幕库最近视频失败`, ex.response.data);
            continue;
        }
    }
})();
