import axios from 'axios';
import config from '../config.js';

export default class DiskApi {

    static async saveByBv(bv) {
        const url = `${config.disk.url}/disks`;
        const res = await axios.post(url, {bv}, {timeout:60 *60 * 1000});
        return res.data;
    }

    static async saveByUrl(downloadUrl) {
        const url = `${config.disk.url}/disks`;
        const res = await axios.post(url, {url: downloadUrl}, {timeout:60 * 60 * 1000});
        return res.data;
    }
}