import axios from 'axios';
import config from '../config.js';

export default class PushApi {
    static async push(title, content) {
        const url = `https://api2.pushdeer.com/message/push?pushkey=${config.push.key}&text=${title}&desp=${content}`;
        console.log(url);
        const res = await axios.get(encodeURI(url));
        console.log(res.data);
    }
}