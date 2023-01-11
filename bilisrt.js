import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

const fromMicroseconds = (microseconds) => {
    const ms = parseInt(microseconds % 1000);
    const seconds = parseInt(microseconds / 1000);
    const ss = parseInt(seconds % 60);
    const minutes = parseInt(seconds / 60);
    const mm = parseInt(minutes % 60);
    const hh = parseInt(minutes / 60);
    return `${hh.toString().padStart(2, 0)}:${mm.toString().padStart(2, 0)}:${ss.toString().padStart(2, 0)},${ms.toString().padStart(3, 0)}`;
}

(async () => {
    const bvid = "BV1fG4y1L7qd";
    // 获取录播基础信息
    const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const infoRes = await fetch(infoUrl);
    const infoJson = await infoRes.json();
    if (!infoRes.ok) {
        PushApi.push(`获取录播基础信息失败(${video.bvid}, ${clip.title})`, ex);
        console.log('获取录播基础信息失败', infoJson);
        return;
    }
    console.log(infoJson);
    // 获取字幕信息
    if (infoJson.data.subtitle.list.length > 0) {
        const subtitleUrl = infoJson.data.subtitle.list[0].subtitle_url;
        const subtitleRes = await fetch(subtitleUrl);
        const subtitleJson = await subtitleRes.json();
        if (!subtitleRes.ok) {
            console.log('获取录播字幕失败');
            return;
        }
        // json格式字幕转换成srt格式
        let srt = '';
        const subtitles = subtitleJson.body;
        for (let k = 0; k < subtitles.length; ++k) {
            const subtitle = subtitles[k];
            const lineId = subtitle.sid;
            const startTime = fromMicroseconds(subtitle.from * 1000);
            const endTime = fromMicroseconds(subtitle.to * 1000);
            const content = subtitle.content;
            const line = `${lineId}\r\n${startTime} --> ${endTime}\r\n${content}\r\n\r\n`;
            srt += line;
        }
        try {
            await writeFile(`${bvid}.srt`, srt);
            console.log('写入字幕成功');
        } catch (ex) {
            console.log('写入字幕文件失败');
            console.log(ex);
        }
    } else {
        console.log('字幕不存在');
    }
})()