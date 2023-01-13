import { readdir, readFile } from 'fs/promises';
import ZimuApi from './api/ZimuApi.js';

(async () => {
    const dir = 'xt/2023';
    const clips = await ZimuApi.findClipsByOrganizationId(12);
    const files = await readdir(dir);
    for (let i = 0; i < files.length; ++i) {
        const file = files[i];
        for (let j = 0 ; j < clips.length; ++j) {
            const clip = clips[j];
            const dt = clip.datetime.replaceAll('-', '').substring(0, 8);
            if (file.indexOf(clip.title) !== -1 && file.indexOf(dt) !== -1) {
                console.log(`match:${clip.title}, ${file}`);
                const data = await readFile(`${dir}/${file}`);
                const srt = data.toString();
                await ZimuApi.insertSubtitle(clip.id, srt);
                console.log('done');
            }
        }
    }
})()