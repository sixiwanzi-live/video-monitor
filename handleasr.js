import fetch from 'node-fetch';
import ZimuApi from './api/ZimuApi.js';

const clipIds = [13318,13319,13320,13325,13328,13330,13337,13338,13342,13352,13354,13355,13359,13368,13369,13373,13385,13387,13390,13401];
(async() => {
    for (let i = 0; i < clipIds.length; ++i) {
        const clipId = clipIds[i];
        const clip = await ZimuApi.findClip(clipId);
        if (clip.type === 1) {
            const bv = clip.playUrl.substring(clip.playUrl.indexOf("BV"), clip.playUrl.length);
            console.log(`${clipId}:${bv}:${clip.title}`);
            const url = `http://jy.zimu.bili.studio:8000/asr?bv=${bv}`;
            tasks.push(new Promise(async (res, rej) => {
                const srt = await (await fetch(url)).text();
                if (srt.length > 0) {
                    console.log(`字幕解析成功：${bv}`);
                    await ZimuApi.insertSubtitle(clipId, srt);
                }
            }));
        }
        if (clip.type === 3) {
            const author = await ZimuApi.findAuthorById(clip.authorId);
            const filename = `${clip.datetime.replaceAll('-', '').replaceAll(':', '').replaceAll(' ', '-')}-${author.name}-${clip.title}`;
            console.log(filename);
            const url = `http://jy.zimu.bili.studio:8000/asr?filename=${filename}`;
            tasks.push(new Promise(async (res, rej) => {
                const srt = await (await fetch(url)).text();
                if (srt.length > 0) {
                    console.log(`字幕解析成功：${filename}`);
                    await ZimuApi.insertSubtitle(clipId, srt);
                }
            }));
        }
        await Promise.all(tasks);
    }
})()