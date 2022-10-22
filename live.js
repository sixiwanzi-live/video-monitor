import axios from 'axios';
import moment from 'moment';
import ZimuApi from './api/ZimuApi.js';
import PushApi from './api/PushApi.js';

const blacklist = [8];

const dirMap = new Map();
dirMap.set(1, `四禧丸子/${moment().format('YYYY.MM')}`);
dirMap.set(2, `四禧丸子/${moment().format('YYYY.MM')}`);
dirMap.set(3, `四禧丸子/${moment().format('YYYY.MM')}`);
dirMap.set(4, `四禧丸子/${moment().format('YYYY.MM')}`);
dirMap.set(5, '量子少年');
dirMap.set(6, '量子少年');
dirMap.set(18, '量子少年');
dirMap.set(19, '量子少年');
dirMap.set(9, 'EOE组合');
dirMap.set(10, 'EOE组合');
dirMap.set(11, 'EOE组合');
dirMap.set(12, 'EOE组合');
dirMap.set(13, 'EOE组合');
dirMap.set(14, 'sp9/明前奶绿');
dirMap.set(15, '星律动');
dirMap.set(16, '星律动');
dirMap.set(17, '星律动');
dirMap.set(20, `sp7/麻尤米mayumi/${moment().format('YYYY.MM')}`);
dirMap.set(21, 'sp9/凜凜蝶凜');
dirMap.set(22, 'ASOUL');
dirMap.set(23, 'ASOUL');
dirMap.set(24, 'ASOUL');
dirMap.set(25, 'ASOUL');

const prefixSet = new Set();
prefixSet.add(20);
prefixSet.add(21);

(async () => {
    const users = (await ZimuApi.findAllAuthors()).data.filter(user => !blacklist.includes(user.id));
    const liveInfoUrl = `https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids?${users.map(user => `uids[]=${user.uid}`).join('&')}`;
    try {
        const res = await axios.get(liveInfoUrl);
        const data = res.data.data;
        for (let i = 0; i < users.length; ++i) {
            const user = users[i];
            const liveInfo      = data[user.uid];
            const liveStatus    = liveInfo.live_status;
            const liveTime      = moment(new Date(parseInt(liveInfo.live_time) * 1000));
            if (liveStatus !== 1) {
                continue;
            }

            const clip = {
                authorId:   user.id,
                title:      liveInfo.title,
                datetime:   liveTime.format('YYYY-MM-DD HH:mm:ss'),
                cover:      liveInfo.cover_from_user.substring(8),
                type:       0
            };
            if (dirMap.has(user.id)) {
                clip.type = 2;
                if (prefixSet.has(user.id)) {
                    clip.playUrl = `bili.lubo.media/d/${dirMap.get(user.id)}/${liveTime.format('YYYYMMDD-HHmmss')}-${user.name}-${clip.title}.mp4`;
                    clip.redirectUrl = `bili.lubo.media/${dirMap.get(user.id)}/${liveTime.format('YYYYMMDD-HHmmss')}-${user.name}-${clip.title}.mp4`;
                } else {
                    clip.playUrl = `bili.lubo.media/d/${dirMap.get(user.id)}/${liveTime.format('YYYYMMDD')}-${user.name}-${clip.title}.mp4`;
                    clip.redirectUrl = `bili.lubo.media/${dirMap.get(user.id)}/${liveTime.format('YYYYMMDD')}-${user.name}-${clip.title}.mp4`;    
                }
            }
            console.log(clip);

            // 检查是否重复
            try {
                const res1 = await ZimuApi.findLatestClipByAuthorId(clip.authorId);
                console.log(`new:${clip.datetime}, latest:${res1.data.datetime}`);
                if (res1.data.datetime !== clip.datetime) {
                    console.log('允许上传');
                    await ZimuApi.insertClip(clip);
                    await PushApi.push(`Author(${clip.authorId}开播了)`, clip.title);
                } else {
                    console.log('重复');
                }
            } catch (ex) {
                console.log(ex.response.data);
                await PushApi.push(`上传主播(${user.id})直播信息失败`, ex.response.data);
            }
        }
    } catch (ex) {
        console.log(ex.response.data);
        await PushApi.push(`获取B站直播信息失败`, ex.response.data);
    }
})()