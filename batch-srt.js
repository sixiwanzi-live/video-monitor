import fetch from "node-fetch";
import ZimuApi from "./api/ZimuApi.js";

(async () => {
    const organzationId = 11;
    const authorId = 30;

    const clips = await ZimuApi.findClipsByOrganizationId(organzationId);
    const filteredClips = clips.filter(clip => clip.authorId === authorId);
    for (let i = 0; i < filteredClips.length; ++i) {
        const clip = filteredClips[i];
        const srtUrl = `https://api.zimu.live/clips/${clip.id}/srt`;
        const srtRes = await fetch(srtUrl);
        const srtText = await srtRes.text();
        if (srtText.length === 0) {
            console.log(`Clip(${clip.id},${clip.datetime},${clip.title})未找到字幕，开始生成`);
            const subtitleUrl = `http://127.0.0.1:6600/clips/${clip.id}/subtitles`;
            const subtitleRes = await fetch(subtitleUrl);
            const subtitle = await subtitleRes.text();
            console.log(`Clip(${clip.id},${clip.datetime},${clip.title})字幕生成完毕`);
            if (subtitle.length > 0) {
                await ZimuApi.insertSubtitle(clip.id, subtitle);
                console.log(`Clip(${clip.id},${clip.datetime},${clip.title})字幕已导入`);
            }
        }
    }
})();