import exec from 'child_process';
import axios from 'axios';
import config from '../config.js';

export default class ZimuApi {
    static async upload(image) {
        const url = `${config.zimu.url}/files/image`;
        const cmd = `curl -s -H "Authorization: Bearer ${config.zimu.auth}" -F file=@${image} ${url}`;
        console.log(cmd);
        return await new Promise((res, rej) => {
            exec.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                    rej(error);
                } else {
                    res(JSON.parse(stdout));
                }                
            });
        });
    };

    static async insertClip(clip) {
        const url = `${config.zimu.url}/clips`;
        return await axios.post(url, clip, {
            headers: {
                'Authorization': `Bearer ${config.zimu.auth}`
            }
        });
    }
}