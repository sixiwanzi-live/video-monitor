import {stat} from 'fs/promises';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

(async () => {
    try {
        const res1 = await ZimuApi.findClipsByOrganizationId(4);
        const clips = res1.data;
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            const bv = clip.bv;
            try {
                await stat(`${bv}.mp4`);
            } catch (ex) {
                console.log(ex);
                continue;
            }
            try {
                console.log(`${clip.title}:${clip.bv}下载开始`);
                await DiskApi.save(bv);
                console.log(`${clip.title}:${clip.bv}下载完成`);
            } catch (ex) {
                console.log(`${clip.title}:${clip.bv}下载失败`);
                console.log(ex);
            }
        }
    } catch (ex) {
        console.log(ex.response.data);
    }
})();