import axios from 'axios';
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

    static async findLatestClipByAuthorId(authorId) {
        const url = `${config.zimu.url}/authors/${authorId}/latest-clip`;
        try {
            return await axios.get(url);
        } catch (ex) {
            console.log(ex);
            await PushApi.push(`查找author(${authorId})的最新视频失败`, ex.response.data);
        }
    }

    static async findClipsByOrganizationId(organizationId) {
        const url = `${config.zimu.url}/organizations/${organizationId}/clips`;
        try {
            return await axios.get(url);
        } catch (ex) {
            console.log(ex);
            await PushApi.push(`查找organization(${organizationId})的视频列表失败`, ex.response.data);
        }
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
}