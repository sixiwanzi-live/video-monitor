import fs from 'fs';
import { promisify } from 'util';
import exec from 'child_process';
import axios from 'axios';
import config from './config.js';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';

(async () => {
    const file = await promisify(fs.readFile)('bv.json', 'utf-8');
    const items = JSON.parse(file);
    for (let i = 0; i < items.length; i++) {
        const res = await axios.get(items[i].url);
        const video = res.data.data.archives[0];
        const title = video.title;
        const bvid = video.bvid;
        const pic = video.pic;
        console.log(`${title},${bvid},${pic}`);

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
        console.log(res1.filename);
    }
    await promisify(fs.writeFile)('bv.json', JSON.stringify(items));
})();
