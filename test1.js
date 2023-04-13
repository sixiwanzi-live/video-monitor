import fetch from 'node-fetch';
import { spawn, exec } from 'child_process';

(async () => {
    const bv = "BV1D24y1w73B";
    const res1 = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`);
    const json1 = await res1.json();
    const cid = json1.data.cid;

    const qn = 120;
    const fnval = 80;
    const res2 = await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${bv}&cid=${cid}&qn=${qn}&fnver=0&fnval=${fnval}&fourk=1`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "max-age=0",
            "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": "buvid3=1920EF7B-3FB3-BEA9-FD90-67037CEA438C01952infoc; b_nut=1662693601; i-wanna-go-back=-1; _uuid=CD5FAFDA-E1032-6D59-BCEE-31061DC8E101D298025infoc; buvid_fp_plain=undefined; hit-dyn-v2=1; dy_spec_agreed=1; LIVE_BUVID=AUTO5016627358096968; nostalgia_conf=-1; buvid4=572A6042-A327-97B8-126A-03818229BEAD03207-022090911-aN5fltImCgRefx+S2eNvlYhgto0P5W6gjYegZNabKIK2/4HOIqiOZw==; fingerprint3=e9bc95f9ea3be414f706bed1d9735fc3; hit-new-style-dyn=0; rpdid=|(k|)Rl)YRRu0J'uYY)YRY)~k; b_ut=5; fingerprint=48862dfb7b7eba23fecac67cf60cf941; buvid_fp=48862dfb7b7eba23fecac67cf60cf941; header_theme_version=CLOSE; CURRENT_BLACKGAP=0; CURRENT_FNVAL=4048; home_feed_column=5; PVID=1; CURRENT_QUALITY=80; DedeUserID=1049010149; DedeUserID__ckMd5=824df193bec2f8d1; CURRENT_PID=f86ea370-d461-11ed-a61b-a510f092157a; FEED_LIVE_VERSION=V8; SESSDATA=a2c0ef10,1696911147,4f2b3*41; bili_jct=e48ba73fa498080a824103d6b8e8d0be; sid=78lg9290; bp_video_offset_1049010149=783864156322267100; b_lsid=10FF453B4_187790A18D2"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    });
    const json2 = await res2.json();
    console.log(json2);
    // return;
    const videoUrl = json2.data.dash.video[0].baseUrl;
    const audioUrl = json2.data.dash.audio[0].baseUrl;
    console.log(videoUrl);
    console.log(audioUrl);

    const st = "01:36:59.533";
    const et = "01:37:13.666";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
    const referer = "https://www.bilibili.com";
    const audio_output = "1.m4a";
    const video_output = "1.mp4";

    await new Promise((res, rej) => {
        exec(`ffprobe -user_agent "${userAgent}" -headers "Referer: ${referer}" -select_streams v -show_frames -show_entries frame=pict_type -of csv ${videoUrl} | grep -n I | cut -d ':' -f 1`, { windowsHide:true }, (err, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (err) {
                console.error(err);
                rej(err);
            } else {
                res();
            }
        });
    });
    return;

    const audio_cmd = [
        '-y',
        '-ss', st, 
        '-to', et, 
        '-accurate_seek', 
        '-seekable', 1, 
        '-user_agent', userAgent, 
        '-headers', `Referer: ${referer}`,
        '-i', audioUrl,
        '-c', 'copy',
        '-avoid_negative_ts', 1,
        audio_output
    ];

    await new Promise((res, rej) => {
        let p = spawn('ffmpeg', audio_cmd);
        p.stdout.on('data', (data) => {
            console.log('stdout: ' + data.toString());
        });
        p.stderr.on('data', (data) => {
            console.log('stderr: ' + data.toString());
        });
        p.on('close', (code) => {
            console.log(`音频生成结束, code:${code}`);
            res();
        });
        p.on('error', (error) => {
            ctx.logger.error(error);
            rej(error);
        });
    });

    const video_cmd = [
        '-y',
        '-ss', st, 
        '-to', et, 
        '-accurate_seek', 
        '-seekable', 1, 
        '-user_agent', userAgent, 
        '-headers', `Referer: ${referer}`,
        '-i', videoUrl,
        '-c', 'copy',
        '-avoid_negative_ts', 1,
        video_output
    ];

    await new Promise((res, rej) => {
        let p = spawn('ffmpeg', video_cmd);
        p.stdout.on('data', (data) => {
            console.log('stdout: ' + data.toString());
        });
        p.stderr.on('data', (data) => {
            console.log('stderr: ' + data.toString());
        });
        p.on('close', (code) => {
            console.log(`视频生成结束, code:${code}`);
            res();
        });
        p.on('error', (error) => {
            ctx.logger.error(error);
            rej(error);
        });
    });

    const mix_cmd = [
        '-y',
        '-i', video_output,
        '-i', audio_output,
        '-c:v', 'copy',
        '-c:a', 'copy',
        '-f', 'mp4',
        `${bv}.mp4`
    ];

    await new Promise((res, rej) => {
        let p = spawn('ffmpeg', mix_cmd);
        p.stdout.on('data', (data) => {
            console.log('stdout: ' + data.toString());
        });
        p.stderr.on('data', (data) => {
            console.log('stderr: ' + data.toString());
        });
        p.on('close', (code) => {
            console.log(`混合结束, code:${code}`);
            res();
        });
        p.on('error', (error) => {
            ctx.logger.error(error);
            rej(error);
        });
    });
})();