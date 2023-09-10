import { renameMp4FilesInDir, askForPath } from './libs/fn';

const main = async function () {
  const dir = await askForPath('MP4 dir');
  await renameMp4FilesInDir(dir);
}

main();
