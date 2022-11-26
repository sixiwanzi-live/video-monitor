import ZimuApi from './api/ZimuApi.js';

(async ()=> {
    const res1 = await ZimuApi.findClipsByOrganizationId(9);
    const clips = res1.data;
    for (let i = 0; i < clips.length; ++i) {
        const clip = clips[i];
        const playUrl = clip.playUrl;
        const redirectUrl = clip.redirectUrl;
        const datetime = clip.datetime;
        if (datetime > '2022-05' && datetime < '2022-06') {
            // console.log(playUrl);
            // 处理playUrl
            let modified = false;
            let newPlayUrl = playUrl.replace('rec.bili.studio/d/ASOUL/', '');
            newPlayUrl = newPlayUrl.replaceAll('.mp4', '');
            newPlayUrl = newPlayUrl.replaceAll('2022.05.', '202205');
            newPlayUrl = newPlayUrl.replaceAll('_', '~');
            if (newPlayUrl.indexOf(' 嘉然 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' 嘉然 ', '-嘉然今天吃什么-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' 向晚 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' 向晚 ', '-向晚大魔王-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' 乃琳 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' 乃琳 ', '-乃琳Queen-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' 贝拉 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' 贝拉 ', '-贝拉kira-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' 珈乐 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' 珈乐 ', '-珈乐Carol-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' A-SOUL游戏室 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' A-SOUL游戏室 ', '-A-SOUL游戏室-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } else if (newPlayUrl.indexOf(' A-SOUL小剧场 ') !== -1) {
                modified = true;
                newPlayUrl = newPlayUrl.replaceAll(' A-SOUL小剧场 ', '-A-SOUL小剧场-');
                newPlayUrl = 'rec.bili.studio/d/ASOUL/' + newPlayUrl + '.mp4';
                console.log(newPlayUrl);
            } 
            // 处理redirectUrl
            let newRedirectUrl = redirectUrl.replace('rec.bili.studio/ASOUL/', '');
            newRedirectUrl = newRedirectUrl.replaceAll('.mp4', '');
            newRedirectUrl = newRedirectUrl.replaceAll('2022.05.', '202205');
            newRedirectUrl = newRedirectUrl.replaceAll('_', '~');
            if (newRedirectUrl.indexOf(' 嘉然 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' 嘉然 ', '-嘉然今天吃什么-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' 向晚 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' 向晚 ', '-向晚大魔王-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' 乃琳 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' 乃琳 ', '-乃琳Queen-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' 贝拉 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' 贝拉 ', '-贝拉kira-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' 珈乐 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' 珈乐 ', '-珈乐Carol-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' A-SOUL游戏室 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' A-SOUL游戏室 ', '-A-SOUL游戏室-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            } else if (newRedirectUrl.indexOf(' A-SOUL小剧场 ') !== -1) {
                modified = true;
                newRedirectUrl = newRedirectUrl.replaceAll(' A-SOUL小剧场 ', '-A-SOUL小剧场-');
                newRedirectUrl = 'rec.bili.studio/ASOUL/' + newRedirectUrl + '.mp4';
                console.log(newRedirectUrl);
            }

            if (modified) {
                let newClip = {};
                newClip.id = clip.id;
                newClip.playUrl = newPlayUrl;
                newClip.redirectUrl = newRedirectUrl;
                const res2 = await ZimuApi.updateClip(newClip);
                console.log(res2.data);
            }
        }
    }
})();
