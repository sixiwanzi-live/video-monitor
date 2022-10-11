import fs from 'fs';
import { unlink } from 'fs/promises';
import { exec, spawn } from 'child_process';
import fetch from "node-fetch";
import ZimuApi from "./api/ZimuApi.js";
import PushApi from './api/PushApi.js';
import config from './config.js';
import { stderr } from 'process';

const toTime = (time) => {
    const ss = time % 60;
    const minutes = Math.floor(time / 60);
    const mm = minutes % 60;
    const hh = Math.floor(minutes / 60);
    return `${hh.toString().padStart(2, 0)}:${mm.toString().padStart(2, 0)}:${ss.toString().padStart(2, 0)},000`;
};

(async () => {
    const clipId = 1954;
    const startTime = Math.round(Math.random() * 10000);
    const endTime = startTime + 10;
    console.log(toTime(startTime), toTime(endTime));

    const res1 = await ZimuApi.segment(clipId, toTime(startTime), toTime(endTime));
    if (!res1.ok) {
        await PushApi.push(`cookies生成切片失败(${clipId}), startTime=${toTime(startTime)}, endTime=${toTime(endTime)}`, await res1.json());
        return;
    }
    const json = await res1.json();
    const filename = json.filename;

    const url = `${config.segment.url}/${filename}`;
    const res2 = await fetch(url);
    const file = fs.createWriteStream(`/tmp/${filename}`);
    console.log(file.path);
    if (!res2.ok) {
        await PushApi.push(`cookies获取切片失败(${clipId}), startTime=${toTime(startTime)}, endTime=${toTime(endTime)}`, await res2.json());
        return;
    }
    try {
        await new Promise((res, rej) => {
            res2.body.pipe(file);
            res2.body.on("error", rej);
            res2.body.on("finish", res);
        });
    } catch (ex) {
        await PushApi.push(`cookies保存切片失败(${clipId}), startTime=${toTime(startTime)}, endTime=${toTime(endTime)}`, ex);
    }
    try {
        await new Promise((res, rej) => {
            exec(`ffprobe ${file.path}`, async (err, stdout, stderr) => {
                if (err) {
                    rej(err);
                } else {
                    console.log(stderr);
                    if (stderr.indexOf('1920x1080') === -1) {
                        await PushApi.push(`cookies失效(${clipId}), startTime=${toTime(startTime)}, endTime=${toTime(endTime)}`, '');
                    }
                    res();
                }
            });
        });
    } catch (ex) {
        await PushApi.push(`cookies分析切片失败(${clipId}), startTime=${toTime(startTime)}, endTime=${toTime(endTime)}`, ex);
    }
    await unlink(file.path);
})()