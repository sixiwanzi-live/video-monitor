import { writeFile } from 'fs/promises';
import fetch from "node-fetch";
import ZimuApi from "./api/ZimuApi.js";

(async () => {
    const organzationId = 12;
    const authorId = 51;

    const clips = await ZimuApi.findClipsByOrganizationId(organzationId);
    const filteredClips = clips.filter(clip => clip.authorId === authorId && clip.type === 1);
    for (let i = 0; i < filteredClips.length; ++i) {
        const clip = filteredClips[i];
        const srtUrl = `https://api.zimu.bili.studio/clips/${clip.id}/srt`;
        const srtRes = await fetch(srtUrl);
        const srtText = await srtRes.text();
        if (srtText.length === 0) {
            console.log(`Clip(${clip.id},${clip.datetime},${clip.title})未找到字幕，开始生成`);
            const bv = clip.playUrl.substring(clip.playUrl.indexOf("BV"), clip.playUrl.length);
            const subtitleUrl = `http://192.168.2.30:7777/asr?bv=${bv}`;
            const subtitleRes = await fetch(subtitleUrl);
            const subtitle = await subtitleRes.text();
            console.log(`Clip(${clip.id},${clip.datetime},${clip.title})字幕生成完毕`);
            if (subtitle.length > 0) {
                await writeFile(`${bv}.srt`, subtitle);
                await ZimuApi.insertSubtitle(clip.id, subtitle);
                console.log(`Clip(${clip.id},${clip.datetime},${clip.title})字幕已导入`);
            }
        }
    }
})();