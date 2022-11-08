
import { stat } from 'fs/promises';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import moment from 'moment';
import PushApi from './api/PushApi.js';
import ZimuApi from './api/ZimuApi.js';

const archives = [
    {
        // 冰糖
        url: 'https://api.bilibili.com/x/series/archives?mid=198297&series_id=210350&only_normal=true&sort=desc&pn=1&ps=1',
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
        organizationId: 8,
        path: `sp9/凜凜蝶凜/${moment().format('YYYY.MM')}`,
        mode: 2
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
    }
];

(async () => {
    for (let i = 0; i < archives.length; ++i) {
        const archive = archives[i];
        if (archive.mode === 1) {
            // 获取B站源
            let video = {};
            try {
                const res = await fetch(archive.url);  // 请求合集列表
                const json = await res.json();
                video = json.data.archives[0];
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex.response.data);
                continue;
            }
            console.log(video.title, video.bvid);
            try {
                // 下载视频
                try {
                    // await DiskApi.saveByBv(video.bvid);
                } catch (ex) {
                    console.log(ex);
                    PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                    continue;
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`查询bv(${video.bvid})的clip失败`, ex.response.data);
                continue;
            }
        } else if (archive.mode === 2) {
            // 需要下载今天和昨天的视频
            const today = moment().format('YYYYMMDD');
            const yesterday = moment().subtract(1, 'days').format('YYYYMMDD');
            // 获取录播站源
            const url = 'https://bili.lubo.media/api/fs/list';
            const params = {
                page: 1,
                password: '',
                path: `/${archive.path}`,
                per_page: 10,
                refresh: false
            };
            try {
                const clips = await ZimuApi.findClipsByOrganizationId(archive.organizationId);
                console.log(params);
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
                    const downloadUrl = `https://bili.lubo.media/d/${archive.path}/${file.name}`;
                    // 匹配YYYYMMDD-{name}-{title}.mp4的文件格式，并且提取出title和name
                    const matches = file.name.match(/([0-9]+)\-(.*)-(.*)\.mp4/y);
                    if (matches && matches.length !== 4) {
                        continue;
                    }
                    const datetime = matches[1];
                    const authorName = matches[2];
                    const title = matches[3];
                    const matchedClip = clips.filter(
                        clip => {
                            return clip.title === title && 
                            clip.author.name === authorName && 
                            clip.datetime.substring(0, 10).replaceAll('-', '') === datetime
                        }
                    )[0];
                    console.log(matchedClip);
                    if (!matchedClip) {
                        continue;
                    }
                    // 生成本地文件路径
                    const dst = `/mnt/data/record/${archive.organizationId}/${authorName}/${datetime.substring(0, 4)}-${datetime.substring(4, 6)}/${matchedClip.datetime.replaceAll('-','').replaceAll(':','').replace(' ', '-')}-${authorName}-${title}.mp4`;
                    // 判断文件是否已经存在，已存在的文件不再下载
                    try {
                        await stat(dst);
                        continue;
                    } catch (ex) {}

                    console.log(downloadUrl);
                    console.log(dst);
                    // 下载视频
                    try {
                        await new Promise((res, rej) => {
                            let cmd = [
                                downloadUrl, '-O', dst
                            ];
                            let p = spawn('wget', cmd);
                            p.stdout.on('data', (data) => {
                                data.toString();
                                // console.log('stdout: ' + data.toString());
                            });
                            p.stderr.on('data', (data) => {
                                data.toString();
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
                    } catch (ex) {
                        console.log(ex);
                        PushApi.push(`下载"${title}"视频失败`, ex.response.data);
                    }
                }
            } catch (ex) {
                console.log(ex);
                PushApi.push(`请求回放列表失败`, ex.response.data);
                continue;
            }
        }
    }
})();
