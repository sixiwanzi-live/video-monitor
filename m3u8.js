import { readdir, mkdir } from 'fs/promises';
import {spawn} from 'child_process';

(async () => {
    const path = '/mnt/data0/5/露早GOGO/2022-10';
    const files = await readdir(path);
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        if (file.indexOf('.mp4') === -1) {
            continue;
        }
        const mp4 = `${path}/${file}`;
        // 创建文件夹
        const dir = mp4.replace('.mp4', '');
        await mkdir(dir);
        console.log(`create dir ${dir}`);
        const m3u8 = `${dir}/index.m3u8`;
        console.log(`create m3u8 ${m3u8}`);
    }
})();