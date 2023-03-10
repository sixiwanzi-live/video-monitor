import moment from 'moment';
import fetch from 'node-fetch';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';

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
    const organizationId = 12;
    const authorId = 34;
    try {
        const url = `https://api.bilibili.com/x/space/wbi/arc/search?mid=209730937&pn=4&ps=50&index=1&order=pubdate&order_avoided=true`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.70"
            }
        });
        const json = await res.json();
        const videos = json.data.list.vlist;

        const clips = await ZimuApi.findClipsByOrganizationId(organizationId);
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            if (clip.authorId !== authorId) {
                continue;
            }
            if (clip.type !== 0) {
                continue;
            }
            const dt = `${clip.datetime.substring(0, 4)}${clip.datetime.substring(5, 7)}${clip.datetime.substring(8, 10)}`;
            console.log(dt);
            for (let j = 0; j < videos.length; ++j) {
                const video = videos[j];
                if (video.title.indexOf(dt) !== -1 && video.title.indexOf(clip.title.replaceAll('!', '').replaceAll('?', '')) !== -1) {
                    await ZimuApi.updateClip({
                        id: clip.id,
                        bv: video.bvid
                    });
                    console.log(`${clip.title},${video.bvid}`);
                    const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${video.bvid}`;
                    const infoRes = await fetch(infoUrl, {
                        headers: {
                            "cookie" : "buvid3=51D755BE-0F5B-66D5-7571-FFF99E5978A573625infoc; b_nut=1678201573; i-wanna-go-back=-1; b_ut=7; b_lsid=3BBC6B9A_186BC9BBAC4; _uuid=BCA4E918-4A96-B3C3-2BB10-9862DCFBFF4967944infoc; header_theme_version=undefined; buvid_fp=d75c37aacd779a08ead4de411872a177; home_feed_column=5; buvid4=20A3F53C-3E2A-7281-8A21-C0FA58F4314074509-023030723-ywPg47KRff1Tgxwale++Uw==; SESSDATA=528e6900,1693753628,0491c*31; bili_jct=b8a1b300b2f7db9f5bc0fb05f44c6939; DedeUserID=95111328; DedeUserID__ckMd5=3ce9e8c3da9ded5d; CURRENT_FNVAL=4048; sid=87bqsd7u; innersign=1; rpdid=|(umkmklJ|~~0J'uY~)k|uYRk"
                        }
                    });
                    const infoJson = await infoRes.json();
                    if (!infoRes.ok) {
                        throw infoJson;
                    }
                    
                    if (infoJson.data.subtitle.list.length > 0) {
                        const subtitleUrl = infoJson.data.subtitle.list[0].subtitle_url;
                        const subtitleRes = await fetch(subtitleUrl);
                        const subtitleJson = await subtitleRes.json();
                        if (!subtitleRes.ok) {
                            throw subtitleJson;
                        }
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
                        await ZimuApi.insertSubtitle(clip.id, srt);
                        console.log(`写入字幕:${video.bvid},${clip.datetime},${video.title}`);
                    } else {
                        console.log(`找不到字幕:${video.bvid},${video.title}`);
                    }
                    break; 
                }
            }
            // await new Promise((res, rej) => { setTimeout(() => { res(); }, 4000)});
        }
    } catch (ex) {
        console.log(ex);
        PushApi.push(`请求organizations(${organizationId})的合集列表失败`, ex);
    }
})();
