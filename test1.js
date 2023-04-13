import fetch from 'node-fetch';
import { spawn, exec } from 'child_process';

(async () => {
    const bv = "BV1D24y1w73B";
    const res1 = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`);
    const json1 = await res1.json();
    const cid = json1.data.cid;
    const cookie = "buvid3=AD937EED-07C2-F583-E415-32C22BF2685F22900infoc; b_nut=1675051622; i-wanna-go-back=-1; _uuid=49D1077C1-FD84-F68C-C7E9-85FD678A485D21789infoc; buvid4=7D3099D8-1965-1A35-FC33-ABA672B3364C77881-023011913-P7lf7sklbprHfmwA5xuV3g==; DedeUserID=95111328; DedeUserID__ckMd5=3ce9e8c3da9ded5d; hit-dyn-v2=1; LIVE_BUVID=AUTO9116750516952078; rpdid=|(k|)Rl)YRRu0J'uY~l|lu~lu; nostalgia_conf=-1; b_ut=5; buvid_fp_plain=undefined; dy_spec_agreed=1; header_theme_version=CLOSE; home_feed_column=5; CURRENT_FNVAL=4048; CURRENT_PID=87fdcbb0-c9f9-11ed-a16e-41c824d3f3cb; hit-new-style-dyn=1; fingerprint=3f6eaf7ea280df74340fcbc17ba5a511; buvid_fp=3f6eaf7ea280df74340fcbc17ba5a511; FEED_LIVE_VERSION=V8; SESSDATA=998ae676,1696834766,fba69*41; bili_jct=aa855795a14b970879744c1a73cab788; sid=8836ahnf; b_lsid=6E107F266_18778D9E5ED; innersign=1; CURRENT_QUALITY=80; bp_video_offset_95111328=783929341015752700; PVID=3";

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
            "cookie": cookie
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

    // await new Promise((res, rej) => {
    //     exec(`ffprobe -user_agent "${userAgent}" -headers "Referer: ${referer}" -select_streams v -show_frames -show_entries frame=pict_type -of csv ${videoUrl} | grep -n I | cut -d ':' -f 1`, { windowsHide:true }, (err, stdout, stderr) => {
    //         console.log(stdout);
    //         console.log(stderr);
    //         if (err) {
    //             console.error(err);
    //             rej(err);
    //         } else {
    //             res();
    //         }
    //     });
    // });

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