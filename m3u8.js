import { readdir } from 'fs/promises';

(async () => {
    const path = '/mnt/data0/5/露早GOGO/';
    const files = await readdir(path);
    console.log(files);
})();