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
    const organizationId = 11;
    const authorId = 30;
    try {
        const archiveUrl = 'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=1682965468&season_id=983010&sort_reverse=false&page_num=1&page_size=100';
        const res = await fetch(archiveUrl);
        const json = await res.json();
        if (!res.ok) {
            throw json;
        }
        const archives = json.data.archives;
        console.log(`archives:${archives.length}`);
        
        const clips = await ZimuApi.findClipsByOrganizationId(organizationId);
        for (let i = 0; i < clips.length; ++i) {
            const clip = clips[i];
            if (clip.authorId !== authorId) {
                continue;
            }
            const title = clip.title;
            for (let j = 0; j < archives.length; ++j) {
                const archive = archives[j];
                if (clip.playUrl.indexOf(archive.bvid) !== -1 && archive.title.indexOf(clip.datetime.substring(0, 10).replaceAll('-','')) !== -1) {
                    // await ZimuApi.updateClip({
                    //     id: clip.id,
                    //     bv: archive.bvid
                    // });
                    // console.log(`${title},${archive.bvid}`);
                    const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${archive.bvid}`;
                    const infoRes = await fetch(infoUrl);
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
                        console.log(`写入字幕:${archive.bvid},${clip.datetime},${archive.title}`);
                    } else {
                        console.log(`找不到字幕:${archive.bvid},${archive.title}`);
                    }
                    break; 
                }
            }
            // await new Promise((res, rej) => {
            //     setTimeout(() => {
            //         res();
            //     }, 1000);
            // });
        }
        // const res1 = await axios.get('https://api.bilibili.com/x/series/archives?mid=351609538&series_id=222746&only_normal=true&sort=desc&pn=1&ps=300');  // 请求合集列表
        // const archives = res1.data.data.archives;
        // for (let i = 0; i < archives.length; ++i) {
        //     const archive = archives[i];

        //     let title   = archive.title;
        //     const bvid  = archive.bvid;
        //     const pic   = archive.pic;
        //     console.log(`${title},${bvid},${pic}`);

        //     // 获取直播时间
        //     const pubdate = title.substring(title.lastIndexOf(' '), title.length);
        //     const datetime = moment(pubdate, 'YYYY年M月D日H点场').format('YYYY-MM-DD HH:mm:ss');
        //     console.log(`直播时间:${datetime}`);

        //     // 修正标题
        //     title = title.replaceAll('【直播回放】', '');
        //     title = title.substring(0, title.lastIndexOf(' '));
        //     console.log(`标题:${title}`);

        //     const cover = pic.substring(7);
        //     console.log(`封面:${cover}`);

        //     // 新增clip
        //     try {
        //         const res2 = await ZimuApi.insertClip({
        //             authorId: authorId,
        //             title: title,
        //             datetime: datetime,
        //             type: 0,
        //             cover: cover
        //         });
        //         PushApi.push(`新增"${title}"clip成功`, `authorId:${authorId},title:${title},datetime:${datetime},bv:${bvid}`);
        //     } catch (ex) {
        //         console.log(ex.response.data);
        //         PushApi.push(`新增"${title}"clip失败`, ex.response.data);
        //         continue;
        //     }
        //     await new Promise((res, rej) => {
        //         setTimeout(() => {
        //             res();
        //         }, 1000);
        //     });
        // }
    } catch (ex) {
        console.log(ex);
        PushApi.push(`请求organizations(${organizationId})的合集列表失败`, ex);
    }
})();
