import axios from 'axios';
import fetch from 'node-fetch';
import config from '../config.js';
import PushApi from './PushApi.js';

export default class ZimuApi {
    static async insertClip(clip) {
        const url = `${config.zimu.url}/clips`;
        try {
            return await axios.post(url, clip, {
                headers: {
                    'Authorization': `Bearer ${config.zimu.auth}`
                }
            });
        } catch (ex) {
            return ex.response.data;
        }
    }

    static async updateClip(clip) {
        const url = `${config.zimu.url}/clips/${clip.id}`;
        try {
            return await axios.put(url, clip, {
                headers: {
                    'Authorization': `Bearer ${config.zimu.auth}`
                }
            });
        } catch (ex) {
            return ex.response.data;
        }
    }

    static async findClip(clipId) {
        const url = `${config.zimu.url}/clips/${clipId}`;
        return await (await fetch(url)).json();
    }

    static async findAuthorById(authorId) {
        const url = `${config.zimu.url}/authors/${authorId}`;
        return await (await fetch(url)).json();
    }

    static async insertSubtitle(clipId, srt) {
        const url = `${config.zimu.url}/clips/${clipId}/subtitles`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.zimu.auth}`,
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: srt
        });
        return;
    }

    static async findLatestClipByAuthorId(authorId) {
        const url = `${config.zimu.url}/authors/${authorId}/latest-clip`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
            throw json;
        }
        return json;
    }

    static async findClipsByOrganizationId(organizationId) {
        const url = `${config.zimu.url}/organizations/${organizationId}/clips`;
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) {
            throw json;
        }
        return json;
    }

    static async findClipsByBv(bv) {
        const url = `${config.zimu.url}/clips?bv=${bv}`;
        try {
            return await axios.get(url);
        } catch (ex) {
            console.log(ex);
            await PushApi.push(`查找bv(${bv})的视频列表失败`, ex.response.data);
        }
    }

    static async findAllAuthors() {
        const url = `${config.zimu.url}/authors`;
        try {
            return await axios.get(url);
        } catch (ex) {
            console.log(ex);
            await PushApi.push(`查找authors列表失败`, ex.response.data);
        }
    }

    static async segment(clipId, startTime, endTime) {
        const url = `${config.zimu.url}/clips/${clipId}/segment?startTime=${startTime}&endTime=${endTime}`;
        return await fetch(url);
    }
}