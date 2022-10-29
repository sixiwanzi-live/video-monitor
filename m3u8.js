import { readdir, mkdir } from 'fs/promises';
import {spawn} from 'child_process';

(async () => {
    const path = '/mnt/data/5/莞儿睡不醒/2022-10';
    const files = await readdir(path);
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        if (file.indexOf('.mp4') === -1) {
            continue;
        }
        const mp4 = `${path}/${file}`;
        // 创建文件夹
        const dir = mp4.replace('.mp4', '');
        try {
            await mkdir(dir);
        } catch (ex) {
            console.log(ex);
        }
        
        console.log(`create dir ${dir}`);
        const m3u8 = `${dir}/index.m3u8`;
        console.log(`create m3u8 ${m3u8}`);

        await new Promise((res, rej) => {
            let cmd = [
                '-i', mp4,
                '-c', 'copy',
                '-start_number', '0',
                '-hls_time', '10',
                '-hls_list_size', '0',
                '-f', 'hls',
                m3u8
            ];
            let p = spawn('ffmpeg', cmd);
            p.stdout.on('data', (data) => {
                console.log('stdout: ' + data.toString());
            });
            p.stderr.on('data', (data) => {
                console.log('stderr: ' + data.toString());
            });
            p.on('close', (code) => {
                console.log(`转码结束:${m3u8}, code:${code}`);
                res();
            });
            p.on('error', (error) => {
                console.error(`错误码:${error}`);
                rej(error);
            });
        });
    }
})();