import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import NodeID3 from 'node-id3';
import cliProgress from 'cli-progress';
import zhConvertor from 'zhconvertor';
import CONFIG from './config';


const joinSuffixes = (): string[] => {
  const suffixes: string[] = [];
  const configSuffixes: string[] = CONFIG.YOUTUBE_CHANNEL_SUFFIXES;

  configSuffixes.forEach((suffix) => {
    suffixes.push(`「${suffix}」`);
    suffixes.push(`【${suffix}】`);
    // suffixes.push(`|${suffix}`);
    // suffixes.push(`| ${suffix}`);
    // suffixes.push(`｜${suffix}`);
    // suffixes.push(`｜ ${suffix}`);
    // suffixes.push(`l${suffix}`);
    // suffixes.push(`l ${suffix}`);
    // suffixes.push(`I${suffix}`);
    // suffixes.push(`I ${suffix}`);
    suffixes.push(suffix);
  });

  return suffixes;
}

const ALL_SUFFIXES: string[] = joinSuffixes();


export type Mp3File = {
  file: string;
  title: string;
  artist: string;
}

export type Mp4File = {
  file: string;
  ctimeMs: number;
  mtimeMs: number;
}

export const askForString = async function (hint: string = "Input a string"): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: hint,
    });

    if (response.value) return response.value;
  }
}

export const askForPath = async function (hint: string = "Input a path"): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: hint,
      validate: (value) => {
        if (!fs.existsSync(value)) return `Path ${value} does not exist`;
        if (!fs.lstatSync(value).isDirectory()) return `Path ${value} is not a directory`;

        return true;
      },
    });

    if (response.value) return response.value;
  }
}


export const askForFile = async function (hint: string = "Path to file"): Promise<string> {
  while (true) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: hint,
      validate: (value) => {
        if (!fs.existsSync(value)) return `File ${value} does not exist`;
        if (!fs.lstatSync(value).isFile()) return `${value} is not a file`;

        return true;
      },
    });

    if (response.value) return response.value;
  }
}

export const getSubDirs = async function (dir: string = ''): Promise<string[]> {
  const dirs: string[] = [];
  const _dirs = fs.readdirSync(dir);

  _dirs.forEach((_dir, i) => {
    const p2f = path.join(dir, _dir);
    if (!fs.lstatSync(p2f).isDirectory()) return;
    if (_dir.startsWith('_') || _dir.startsWith('.')) return;

    dirs.push(_dir);
  });

  console.log(`\nFound ${dirs.length} directories...\n`);
  return dirs;
}


export const getMp3Files = async function (dir: string = ''): Promise<Mp3File[]> {
  if (!dir) dir = await askForPath('MP3 dir');

  const files: Mp3File[] = [];
  const _files = fs.readdirSync(dir);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  console.log('\nDiscovering in directory...');
  bar.start(_files.length, 0);


  _files.forEach((file, i) => {
    const n = i + 1;

    const p2f = path.join(dir, file);
    if (fs.lstatSync(p2f).isDirectory()) return;
    if (file.startsWith('_') || file.startsWith('.')) return;
    if (path.extname(p2f) !== '.mp3') return;

    const tags = readTags(p2f);

    files.push({
      file: file,
      title: tags.title || '',
      artist: tags.artist || '',
    });

    bar.update(n);
  });

  bar.stop();

  console.log(`\nFound ${files.length} MP3 files...\n`);
  return files;
}





export const getMp4Files = async function (dir: string = ''): Promise<Mp4File[]> {
  if (!dir) dir = await askForPath('MP4 dir');

  const files: Mp4File[] = [];
  const _files = fs.readdirSync(dir);

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  console.log(`\nDiscovering in 「${dir}」...`);
  bar.start(_files.length, 0);

  _files.forEach((file, i) => {
    const n = i + 1;

    const p2f = path.join(dir, file);
    if (fs.lstatSync(p2f).isDirectory()) return;
    if (file.startsWith('_') || file.startsWith('.')) return;
    if (path.extname(p2f) !== '.mp4') return;

    const stat = fs.statSync(p2f);

    files.push({
      file: file,
      ctimeMs: stat.ctimeMs,
      mtimeMs: stat.mtimeMs,
    });

    bar.update(n);
  });

  bar.stop();

  console.log(`Found ${files.length} MP4 files...\n`);
  return files;
}

export const renameMp4FilesInDir = async function (dir: string = '') {
  // const dir = await askForPath('MP4 dir');
  const mp4Files: Mp4File[] = await getMp4Files(dir);
  const ordFiles = mp4Files.sort((a, b) => a.ctimeMs - b.ctimeMs);
  const padLength = mp4Files.length.toString().length + 1;

  ordFiles.forEach((mp4File, i) => {
    const n = i + 1;
    const pOld = path.join(dir, mp4File.file);

    let basename = zhConvertor.t2s(path.basename(mp4File.file, '.mp4'))
      .trim()
      .replace(/^\d+\s-\s/, '')
      .trim();

    ALL_SUFFIXES.forEach((suffix) => basename = basename.replace(new RegExp(`${suffix}$`, "gi"), '').trim());

    basename = basename
      .replace(/\|$/gi, '')
      .replace(/｜$/gi, '')
      .replace(/l$/gi, '')
      .replace(/I$/gi, '')
      .trim()
      .replace(/[…]+$/, '')
      .trim();

    const pNew = path.join(dir, `${String(n).padStart(padLength, '0')} - ${basename}.mp4`);
    // console.log(pOld);
    // console.log(pNew);

    if (pOld !== pNew) {
      console.log(pNew);
      fs.renameSync(pOld, pNew);
    }
  });

  return;
}

const options = {
  // only read the specified tags (default: all)
  include: [
    'TOPE',
    'TPE1',
    'TPE2',
    'TPE3',
    'TPE4',
    '',
    'TIT1',
    'TIT2',
    'TIT3',
    '',
    'TOAL',
  ],

  // don't read the specified tags (default: [])
  exclude: [],
  // only return raw object (default: false)
  onlyRaw: false,
  // don't generate raw object (default: false)
  noRaw: true,
}

export function readTags(path: string) {
  return NodeID3.read(path, options);
}
