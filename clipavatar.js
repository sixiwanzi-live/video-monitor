import axios from 'axios';
import ZimuApi from './api/ZimuApi.js';

(async () => {
    try {
        const res1 = await ZimuApi.findClipsByOrganizationId(7);
        const clips = res1.data;
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            const bv = clip.bv;
            const res2 = await axios.get(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`);
            const cover = res2.data.data.pic.substring(7);
            console.log(cover);
            await ZimuApi.updateClip({id: clip.id, cover: cover});
        }
    } catch (ex) {
        console.log(ex.response.data);
    }
})();