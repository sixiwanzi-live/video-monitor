import exec from 'child_process';
import axios from 'axios';
import config from '../config.js';

export default class ZimuApi {
    static async upload(image) {
        const url = `${config.zimu.url}/files/image`;
        const cmd = `curl -s -H "Authorization: Bearer ${config.zimu.auth}" -F file=@${image} ${url}`;
        console.log(cmd);
        await new Promise((res, rej) => {
            exec.exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(stderr);
                    rej(error);
                } else {
                    const json = JSON.parse(stdout);
                    console.log(json);
                    res(json);
                }                
            });
        });
    }
}