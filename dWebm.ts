import fs from 'fs';
import path from 'path';
import { getSubDirs, getWebmFiles, askForPath } from './libs/fn';
import { utimes } from 'utimes';
import CONFIG from './libs/config';

const main = async function () {
  const dir = CONFIG.YOUTUBE_CHANNEL_DIRS || await askForPath('Path to .webm directories');
  const dirs: string[] = await getSubDirs(dir);

  console.log(dirs);

  dirs.forEach(async (_dir) => {
    const _p2d = path.join(dir, _dir);

    const files = await getWebmFiles(_p2d);

    files.forEach(async (webmFile) => {
      const p2webm = path.join(_p2d, webmFile.file);
      const p2mp4 = path.join(_p2d, `${path.basename(webmFile.file, '.webm')}.mp4`);

      if (fs.existsSync(p2mp4)) {
        console.log(`Found .webm => .mp4 file: ${p2mp4}`);

        const stat = fs.statSync(p2webm);

        await utimes(p2mp4, {
          btime: stat.birthtimeMs,
          mtime: stat.mtimeMs,
          atime: stat.atimeMs,
        });
      }
    });

    // await renameMp4FilesInDir(_p2d);
  });
}

main();
