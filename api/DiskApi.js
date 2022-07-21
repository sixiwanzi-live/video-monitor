import axios from 'axios';
import config from '../config.js';

export default class DiskApi {
    static async save(bv) {
        const url = `${config.disk.url}/disks`;
        const res = await axios.post(url, {bv});
        console.log(res.data);
        return res.data;
    }
}