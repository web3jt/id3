import { renameMp4FilesInDir, askForPath } from './libs/fn';
import CONFIG from './libs/config';

const main = async function () {
  const dir = CONFIG.MP4_DIR || await askForPath('MP4 dir');
  await renameMp4FilesInDir(dir);
}

main();
