import fs from 'fs';
import { promisify } from 'util';
import exec from 'child_process';
import axios from 'axios';
import moment from 'moment';
import config from './config.js';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';

(async () => {
    const file = await promisify(fs.readFile)('bv.json', 'utf-8');
    const items = JSON.parse(file);
    for (let i = 0; i < items.length; i++) {
        const authorId = items[i].id;
        const res = await axios.get(items[i].url);
        const video = res.data.data.archives[0];
        let title = video.title;
        const bvid = video.bvid;
        const pic = video.pic;
        console.log(`${title},${bvid},${pic}`);

        // 修正标题
        title = title.replaceAll('【直播回放】', '');
        const pubdate = title.substring(title.lastIndexOf(' '), title.length);
        const datetime = moment(pubdate, 'YYYY年M月D日H点场').format('YYYY-MM-DD HH:mm:ss');
        console.log(datetime);
        title = title.substring(0, title.lastIndexOf(' '));
        console.log(title);

        // 下载封面图
	    const cmd = `wget ${pic} -O ${config.tmp.path}/${bvid}.jpg`;
        console.log(cmd);
        await new Promise((res, rej) => {
            exec.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    rej(error);
                } else {
                    console.log(stdout);
                    console.log(stderr);
                }                
                res();
            });
        });
        // 上传封面图
        const res1 = await ZimuApi.upload(`${config.tmp.path}/${bvid}.jpg`);
        const filename = res1.filename;

        // 新增clip
        const res2 = await ZimuApi.insertClip({
            authorId: authorId,
            title: title,
            datetime: datetime,
            bv: bvid,
            filename: filename
        });
        console.log(res2);
    }
    await promisify(fs.writeFile)('bv.json', JSON.stringify(items));
})();
