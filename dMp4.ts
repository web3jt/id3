import path from 'path';
import { getSubDirs, renameMp4FilesInDir, askForPath } from './libs/fn';

const main = async function () {
  const dir = await askForPath('Path to MP4 directories')
  const dirs: string[] = await getSubDirs(dir);

  console.log(dirs);

  dirs.forEach(async (_dir) => {
    const _p2d = path.join(dir, _dir);
    await renameMp4FilesInDir(_p2d);
  });

  // const dir = await askForPath('MP4 dir');
  // await renameMp4FilesInDir(dir);
}

main();
