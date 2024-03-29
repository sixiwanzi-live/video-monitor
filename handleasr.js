import fetch from 'node-fetch';
import ZimuApi from './api/ZimuApi.js';

// const clipIds = [14841,14850,14854,14858,14864,14919];
const clipIds = [15680,15685,15624,15573,15577,15589,15593,15594,15599,15600,15612,15625,15587,15588];
(async() => {
    let tasks = [];
    for (let i = 0; i < clipIds.length; ++i) {
        const clipId = clipIds[i];
        const clip = await ZimuApi.findClip(clipId);
        if (clip.type === 1) {
            const bv = clip.playUrl.substring(clip.playUrl.indexOf("BV"), clip.playUrl.length);
            console.log(`${clipId}:${bv}:${clip.title}`);
            const url = `http://jy.zimu.bili.studio:8001/asr?bv=${bv}`;
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
            const url = `http://jy.zimu.bili.studio:8001/asr?filename=${filename}`;
            tasks.push(new Promise(async (res, rej) => {
                const srt = await (await fetch(url)).text();
                if (srt.length > 0) {
                    console.log(`字幕解析成功：${filename}`);
                    await ZimuApi.insertSubtitle(clipId, srt);
                }
            }));
        }
    }
    await Promise.all(tasks);
})()