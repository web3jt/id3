import fs from 'fs';
import path from 'path';
import { askForString, getMp3Files, askForPath, readTags } from './fn';

const keepChars = function (str: string = ''): string {
  return str.replace(`'s`, 's').replace(/[^\w\d\u4e00-\u9fa5]/g, ' ').trim().replace(/\s+/g, '_');
}

const main = async function () {
  const dir = await askForPath('MP3 dir');
  const srcFiles = await getMp3Files(dir);
  const shuffleFiles = srcFiles.sort(() => 0.5 - Math.random());

  const padLength = srcFiles.length.toString().length + 1;

  shuffleFiles.forEach((file, i) => {
    const n = i + 1;
    const dstFile = `${String(n).padStart(padLength, '0')} - ${keepChars(file.title)}.mp3`;
    const srcP2f = path.join(dir, file.file);
    const dstP2f = path.join(dir, dstFile);

    fs.renameSync(srcP2f, dstP2f);
    console.log(n, dstP2f);
  });

  const parentDir = path.dirname(dir);
  const playlistsDir = path.join(parentDir, 'playlists');
  if (!fs.existsSync(playlistsDir)) return;

  const playlist: string[] = ['#EXTM3U'];

  const dirName = dir.replace(parentDir, '..');
  const newFiles = await getMp3Files(dir);
  newFiles.forEach((file, i) => {
    playlist.push(path.join(dirName, file.file));
  });

  const playlistName = await askForString('playlist name');
  const playlistFile = path.join(playlistsDir, `${playlistName}.m3u`);

  fs.writeFileSync(playlistFile, playlist.join('\n'));
}

main();
