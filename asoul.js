import axios from "axios";
import moment from "moment";
import ZimuApi from "./api/ZimuApi.js";

(async () => {
    const authorId = 34;
    try {
        const res = await axios.get("https://api.matsuri.icu/channel/1501380958/clips");
        const items = res.data.data;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            const title = item.title;
            const datetime = moment(item.start_time).format("YYYY-MM-DD HH:mm:ss");
            const cover = item.cover.substring(8);
            if (datetime > '2022') {
                const clip = {
                    authorId: authorId,
                    title: title,
                    cover: cover,
                    datetime: datetime
                };
                console.log(clip);
                try {
                    await ZimuApi.insertClip(clip);
                    console.log("写入成功");
                } catch (ex) {
                    console.log(ex.response.data);
                }
            }
        }
    } catch (ex) {
        console.log(ex.response.data);
    }
})();