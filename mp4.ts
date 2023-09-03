import fs from 'fs';
import path from 'path';
import zhConvertor from 'zhconvertor';
import { Mp4File, getMp4Files, askForPath } from './libs/fn';

const main = async function () {
  const dir = await askForPath('MP4 dir');
  const mp4Files: Mp4File[] = await getMp4Files(dir);
  const ordFiles = mp4Files.sort((a, b) => a.ctimeMs - b.ctimeMs);
  const padLength = mp4Files.length.toString().length + 1;

  ordFiles.forEach((mp4File, i) => {
    const n = i + 1;
    const pOld = path.join(dir, mp4File.file);

    const basename = zhConvertor.t2s(path.basename(mp4File.file, '.mp4'))
      .trim()
      .replace(/^\d+\s-\s/, '')
      // .replace('', '')
      .replace(/[…]+$/, '')
      .trim();

    const pNew = path.join(dir, `${String(n).padStart(padLength, '0')} - ${basename}.mp4`);

    if (pOld !== pNew) {
      console.log(n, pNew);
      fs.renameSync(pOld, pNew);
    }
  });
}

main();
