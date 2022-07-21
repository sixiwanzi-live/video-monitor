import exec from 'child_process';
import axios from 'axios';
import config from '../config.js';

export default class ZimuApi {
    static async upload(image) {
        const url = `${config.zimu.url}/files/image`;
        const cmd = `curl -H "Authorization: Bearer ${config.zimu.auth}" -F file=@${image} ${url}`;
        console.log(cmd);
        await new Promise((res, rej) => {
            exec.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    rej(error);
                } else {
                    console.log(stdout);
                    console.log(stderr);
                }                
                res();
            });
        });
    }
}