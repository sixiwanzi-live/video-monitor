import axios from 'axios';
import moment from 'moment';
import ZimuApi from './api/ZimuApi.js';
import PushApi from './api/PushApi.js';

const users = [{id: 20, uid: 1265605287}];

(async () => {
    const liveInfoUrl = `https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids?${users.map(user => `uids[]=${user.uid}`).join('&')}`;
    try {
        const res = await axios.get(liveInfoUrl);
        const data = res.data.data;
        users.forEach(async user => {
            const liveInfo      = data[user.uid];
            const liveStatus    = parseInt(liveInfo.live_status);
            // 非直播状态不考虑
            if (liveStatus !== 0) {
                const clip = {
                    authorId:   user.id,
                    title:      liveInfo.title,
                    datetime:   moment(new Date(parseInt(liveInfo.live_time) * 1000)).format('YYYY-MM-DD HH:mm:ss'),
                    cover:      liveInfo.cover_from_user.substring(8)
                };
                console.log(clip);

                // 检查是否重复
                try {
                    const res1 = await ZimuApi.findLatestClipByAuthorId(clip.authorId);
                    console.log(`new:${clip.datetime}, latest:${res1.data.datetime}`);
                    if (res1.data.datetime !== clip.datetime) {
                        console.log('允许上传');
                        //await ZimuApi.insertClip(clip);
                    } else {
                        console.log('重复');
                    }
                } catch (ex) {
                    console.log(ex.response.data);
                    await PushApi.push(`上传主播(${user.id})直播信息失败`, ex.response.data);
                }
            }
        });
    } catch (ex) {
        console.log(ex.response.data);
        await PushApi.push(`获取B站直播信息失败`, ex.response.data);
    }
})()