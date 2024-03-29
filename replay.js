
import { stat } from 'fs/promises';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import moment from 'moment';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';
import DiskApi from './api/DiskApi.js';

const archives = [
    {
        // AI中国绊爱
        authorId: 8,
        url: 'https://api.bilibili.com/x/series/archives?mid=484322035&series_id=210661&only_normal=true&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        organizationId: 7,
        path: `星律动/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        organizationId: 1,
        path: `四禧丸子/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        // 凜凜蝶凜
        authorId: 21,
        url: 'https://api.bilibili.com/x/series/archives?mid=1220317431&series_id=2610314&only_normal=true&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        organizationId: 9,
        path: `ASOUL/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        organizationId: 5,
        path: `EOE组合/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        organizationId: 2,
        path: `量子少年/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        organizationId: 6,
        path: `sp9/明前奶绿/${moment().format('YYYY.MM')}`,
        mode: 2
    },
    {
        // 灯夜tomoya
        authorId: 29,
        url: 'https://api.bilibili.com/x/series/archives?mid=1854400894&series_id=2880259&only_normal=true&sort=desc&pn=1&ps=1',
        mode: 1
    },
    {
        // 扇宝
        authorId: 30,
        url: 'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid=1682965468&season_id=983010&sort_reverse=false&page_num=1&page_size=1',
        mode: 1
    },
];

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
    for (let i = 0; i < archives.length; ++i) {
        const archive = archives[i];
        // 处理B站源
        if (archive.mode === 1) {
            const clip = await ZimuApi.findLatestClipByAuthorId(archive.authorId);
            // 如果不是直播中或者待解析就不用更新
            if (clip.type !== 4 || clip.type !== 1) {
                continue;
            }
            // 获取B站源
            let video = {};
            const archiveRes = await fetch(archive.url);  // 请求合集列表
            const archiveJson = await archiveRes.json();
            if (!archiveRes.ok) {
                PushApi.push(`请求回放列表失败`, JSON.stringify(archiveJson));
                continue;
            }
            video = archiveJson.data.archives[0];
            console.log(`列表中的最新录播为:${video.title},${video.bvid}`);

            if (video.title.indexOf(clip.title) === -1) {
                continue;
            }

            try {
                const updatedClip = {
                    id: clip.id,
                    bv: video.bvid
                };
                console.log(`将更新clip:${updatedClip.id},${updatedClip.bv}`);
                await ZimuApi.updateClip(updatedClip);
            } catch (ex) {
                console.log(ex);
                PushApi.push(`更新clip(${clip.title})的bv失败`, ex);
                continue;
            }
            try {
                // 获取录播基础信息
                const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${video.bvid}`;
                const infoRes = await fetch(infoUrl);
                const infoJson = await infoRes.json();
                if (!infoRes.ok) {
                    PushApi.push(`获取录播基础信息失败(${video.bvid}, ${clip.title})`, ex);
                    continue;
                }
                // 获取字幕信息
                if (infoJson.data.subtitle.list.length > 0) {
                    const subtitleUrl = infoJson.data.subtitle.list[0].subtitle_url;
                    const subtitleRes = await fetch(subtitleUrl);
                    const subtitleJson = await subtitleRes.json();
                    if (!subtitleRes.ok) {
                        console.log(`获取录播字幕失败(${video.bvid}, ${clip.title})`);
                        PushApi.push(`获取录播字幕失败(${video.bvid}, ${clip.title})`, JSON.stringify(subtitleJson));
                        continue;
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
                    await ZimuApi.insertSubtitle(clip.id, srt);
                    console.log(`写入字幕:${video.bvid},${clip.datetime},${video.title}`);
                } else {
                    console.log(`写入字幕失败:${video.bvid},${video.title}`);
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`更新clip(${clip.title})的subtitle失败`, ex);
                continue;
            }
        } else if (archive.mode === 2) {
            // 获取录播站源
            const clips = await ZimuApi.findClipsByOrganizationId(archive.organizationId);
            // 需要下载今天和昨天的视频
            const today = moment().format('YYYYMMDD');
            const yesterday = moment().subtract(1, 'days').format('YYYYMMDD');

            const url = 'https://rec.bili.studio/api/fs/list';
            const params = {
                page: 1,
                password: '',
                path: `/${archive.path}`,
                per_page: 10,
                refresh: false
            };
            console.log(params);
            try {
                const res = await fetch(url, {
                    method: 'post',
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const json = await res.json();
                if (!res.ok) {
                    throw json;
                }
                const files = json.data.content.filter(file => !file.is_dir && file.type === 2 && file.size > 0);
                for (let i = 0; i < files.length; ++i) {
                    const file = files[i];
                    // 不是昨天或者今天的录播就不下载
                    if (!file.name.startsWith(today) && !file.name.startsWith(yesterday)) {
                        continue;
                    }
                    // 生成下载地址
                    const downloadUrl = `https://rec.bili.studio/d/${archive.path}/${file.name}`;
                    // 提取date,title和name
                    let date = '';
                    let authorName = '';
                    let title = '';
                    
                    // 匹配YYYYMMDD-HHmmss-{name}-{title}.mp4的文件格式
                    let matches = file.name.match(/([0-9]+)\-([0-9]+)\-(.*)-(.*)\.mp4/y);
                    console.log(matches);
                    date = matches[1];
                    authorName = matches[3];
                    title = matches[4];
                    
                    const matchedClip = clips.filter(
                        clip => {
                            return clip.title === title.replaceAll('_', '') && 
                            clip.author.name === authorName && 
                            clip.datetime.substring(0, 10).replaceAll('-', '') === date
                        }
                    )[0];
                    if (!matchedClip) {
                        console.log('无匹配clip');
                        continue;
                    }
                    // 生成本地文件路径
                    const dst = `/mnt/data/record/${archive.organizationId}/${authorName}/${date.substring(0, 4)}-${date.substring(4, 6)}/${matchedClip.datetime.replaceAll('-','').replaceAll(':','').replace(' ', '-')}-${authorName}-${matchedClip.title}.mp4`;
                    // 判断文件是否已经存在，已存在的文件不再下载
                    try {
                        await stat(dst);
                        console.log('MP4文件已经存在');
                        continue;
                    } catch (ex) {}

                    console.log(`下载地址:${downloadUrl}`);
                    console.log(`本地路径:${dst}`);
                    // 下载视频
                    try {
                        await new Promise((res, rej) => {
                            let cmd = [
                                downloadUrl, '-O', dst
                            ];
                            let p = spawn('wget', cmd);
                            p.stdout.on('data', (data) => {
                                // console.log('stdout: ' + data.toString());
                            });
                            p.stderr.on('data', (data) => {
                                // console.log('stderr: ' + data.toString());
                            });
                            p.on('close', (code) => {
                                console.log(`下载结束, code:${code}`);
                                res();
                            });
                            p.on('error', (error) => {
                                console.error(`错误码:${error}`);
                                rej(error);
                            });
                        });
                        const updatedClip = {
                            id: matchedClip.id,
                            type: 2,
                            playUrl: `rec.bili.studio/d/${archive.path}/${file.name}`,
                            redirectUrl: `rec.bili.studio/${archive.path}/${file.name}`
                        };
                        console.log(updatedClip);
                        await ZimuApi.updateClip(updatedClip);
                    } catch (ex) {
                        console.log(ex);
                        PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                    }
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex);
                continue;
            }
        }
    }
})();
