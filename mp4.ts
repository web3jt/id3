import fs from 'fs';
import path from 'path';
import { Mp4File, getMp4Files, askForPath } from './libs/fn';

const main = async function () {
  const dir = await askForPath('MP4 dir');
  const mp4Files: Mp4File[] = await getMp4Files(dir);
  const ordFiles = mp4Files.sort((a, b) => a.ctimeMs - b.ctimeMs);
  const padLength = mp4Files.length.toString().length + 1;

  ordFiles.forEach((mp4File, i) => {
    const pOld = path.join(dir, mp4File.file);

    const basename = path.basename(mp4File.file, '.mp4')
      .trim()
      .replace(/^\d+\s-\s/, '')
      // .replace('| 黑毛羊駝', '')
      // .replace('|黑毛羊駝', '')
      // .replace('丨黑毛羊駝', '')
      // .replace('|seeker大师兄', '')
      // .replace('| seeker 大師兄', '')
      // .replace('| seeker 大师兄', '')
      // .replace('| seeker大師兄', '')
      // .replace('| seeker大师兄', '')
      // trim end
      .replace(/[…]+$/, '')
      .trim();

    const pNew = path.join(dir, `${String(i + 1).padStart(padLength, '0')} - ${basename}.mp4`);

    if (pOld !== pNew) {
      console.log(i, pNew);
      fs.renameSync(pOld, pNew);
    }

  });
}

main();
