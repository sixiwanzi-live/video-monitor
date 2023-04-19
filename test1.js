import fetch from 'node-fetch';
import { spawn, exec } from 'child_process';
import readline from 'readline';

const fromMicroseconds = (microseconds) => {
    const ms = parseInt(microseconds % 1000);
    const seconds = parseInt(microseconds / 1000);
    const ss = parseInt(seconds % 60);
    const minutes = parseInt(seconds / 60);
    const mm = parseInt(minutes % 60);
    const hh = parseInt(minutes / 60);
    return `${hh.toString().padStart(2, 0)}:${mm.toString().padStart(2, 0)}:${ss.toString().padStart(2, 0)}.${ms.toString().padStart(3, 0)}`;
}

(async () => {
    const bv = "BV1Rk4y1a7i8";
    const res1 = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bv}`);
    const json1 = await res1.json();
    const cid = json1.data.cid;
    const cookie = "buvid3=5BB7157D-F0DB-A3A5-76EB-3460647B145932606infoc; i-wanna-go-back=-1; b_ut=7; b_lsid=10FD284F8_18756212FFC; _uuid=9A646A13-F10106-97F6-66F1-BB83B5C10285D28290infoc; header_theme_version=undefined; buvid_fp=d993e2fc76b5f336da25f33a48898dcf; home_feed_column=5; buvid4=64A24733-A2A4-E17E-E20F-88777FA80C3233153-023040618-EztQZa53xaYimQKQidPgYA==; b_nut=1680777229; SESSDATA=0fc0223c,1696329249,1d8e4*42; bili_jct=9f275e1a83df103b27c7a2c3f57e26ea; DedeUserID=95111328; DedeUserID__ckMd5=3ce9e8c3da9ded5d; sid=6aia571r; CURRENT_FNVAL=4048; innersign=1; CURRENT_PID=8f9ae840-d466-11ed-b56f-134c895dceba; rpdid=|(J~JJuJ|m))0J'uY)|~~~klk";

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
    console.log(`video:${videoUrl}`);
    console.log(`audio:${audioUrl}`);

    const st = "01:00:00.000";
    const et = "01:01:00.000";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
    const referer = "https://www.bilibili.com";
    const audio_output = "1.m4a";
    const video_output = "1.mp4";
    
    // 获取视频切片
    const video_cmd = [
        '-y',
        '-ss', st, 
        '-to', et, 
        '-accurate_seek', 
        '-seekable', 1, 
        '-user_agent', userAgent, 
        '-headers', `Referer: ${referer}`,
        '-i', videoUrl,
        '-copyts',
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

    let cur_st = '';
    let cur_et = '';
    // 分析视频实际长度
    await new Promise((res, rej) => {
        let p = spawn('ffprobe', [video_output]);
        const rl = readline.createInterface({
            input: p.stderr
        });
        rl.on('line', line => {
            if (line.indexOf('Duration') !== -1 && line.indexOf('description')) {
                console.log('stderr: ' + line);
                const t1 = line.split(',');
                cur_et = `${t1[0].replace('Duration:    ', '')}0`;
                cur_st = fromMicroseconds(t1[1].replace('start: ', '') * 1000);
                console.log(t1[1].replace('start: ', '') * 1000);
            }
        });
        p.stdout.on('data', (data) => {
            console.log('stdout: ' + data.toString());
        });
        p.on('close', (code) => {
            console.log(`视频分析结束, code:${code}`);
            res();
        });
        p.on('error', (error) => {
            ctx.logger.error(error);
            rej(error);
        });
    });
    console.log(`cur_st:${cur_st}`);
    console.log(`cur_et:${cur_et}`);

    const audio_cmd = [
        '-y',
        '-ss', cur_st, 
        '-to', cur_et, 
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