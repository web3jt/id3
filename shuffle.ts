import fs from 'fs';
import path from 'path';
import { getMp3Files, askForPath, readTags } from './fn';

const keepChars = function (str: string = ''): string {
  return str.replace(`'s`, 's').replace(/[^\w\d\u4e00-\u9fa5]/g, ' ').trim().replace(/\s+/g, '_');
}

const main = async function () {
  const ids: number[] = [];
  const dir = await askForPath('MP3 dir');
  const files = await getMp3Files(dir);
  // const files = await getMp3Files();
  const padLength = files.length.toString().length;

  while (ids.length < files.length) ids.push(ids.length + 1);

  const shuffle = ids.sort((a, b) => 0.5 - Math.random());

  files.forEach((p2f, i) => {
    const tags = readTags(p2f);
    const newFile = `${String(shuffle.pop()).padStart(padLength, '0')} - ${keepChars(tags.title)}.mp3`;
    // const newFile = `${String(shuffle.pop()).padStart(padLength, '0')} - ${keepChars(tags.title)} - ${keepChars(tags.artist)}.mp3`;
    fs.renameSync(p2f, path.join(dir, newFile));
    console.log(i + 1, newFile);
  });
}

main();
