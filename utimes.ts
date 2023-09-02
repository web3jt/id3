import fs from 'fs';

import { utimes } from 'utimes';
import { askForFile } from './libs/fn';

const main = async function () {
  const srcFile = await askForFile('Src file');
  const dstFile = await askForFile('Dst file');

  const srcStat = fs.statSync(srcFile);

  await utimes(dstFile, {
    btime: srcStat.birthtimeMs,
    mtime: srcStat.mtimeMs,
    atime: srcStat.atimeMs,
  });

  const dstStat = fs.statSync(dstFile);

  console.log(srcStat.birthtimeMs, dstStat.mtimeMs, dstStat.atimeMs);
  console.log(dstStat.birthtimeMs, dstStat.mtimeMs, dstStat.atimeMs);
  console.log('Done.');
}

main();
