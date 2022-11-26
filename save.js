import axios from 'axios';
import { spawn } from 'child_process';

(async () => {
    const path = '四禧丸子/2022.05';
    // 获取录播站源
    const url = 'https://rec.bili.studio/api/fs/list';
    const params = {
        page: 1,
        password: '',
        path: `/${path}`,
        per_page: 100,
        refresh: false
    };
    try {
        console.log(params);
        const res = await axios.post(url, params);
        const files = res.data.data.content;
        for (let i = 0; i < files.length; ++i) {
            const file = files[i];
            if (file.name.indexOf('.mp4') === -1) continue;
            const downloadUrl = encodeURI(`https://rec.bili.studio/d/${path}/${file.name}`);
            console.log(downloadUrl);
            const dest = `/mnt/data/tmp/video/${path}/${file.name}`;
            console.log(dest);
            await new Promise((res, rej) => {
                let cmd = [
                    '-L', downloadUrl,
                    '-o', dest
                ];
                let p = spawn('curl', cmd);
                p.stdout.on('data', (data) => {
                    console.log('stdout: ' + data.toString());
                });
                p.stderr.on('data', (data) => {
                    console.log('stderr: ' + data.toString());
                });
                p.on('close', (code) => {
                    console.log(`下载结束:${dest}, code:${code}`);
                    res();
                });
                p.on('error', (error) => {
                    console.error(`错误码:${error}`);
                    rej(error);
                });
            });
            await new Promise((res, rej) => {
                setTimeout(() => {
                    res();
                }, 1000 * 60 * 20);
            });
        }
    } catch (ex) {
        console.log(ex);
    }
})();
