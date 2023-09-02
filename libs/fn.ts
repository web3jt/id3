import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import NodeID3 from 'node-id3';


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

export const getMp3Files = async function (dir: string = ''): Promise<Mp3File[]> {
  if (!dir) dir = await askForPath('MP3 dir');

  const files: Mp3File[] = [];
  const _files = fs.readdirSync(dir);

  _files.forEach((file, i) => {
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
  });

  console.log(`\nFound ${files.length} MP3 files...\n`);
  return files;
}





export const getMp4Files = async function (dir: string = ''): Promise<Mp4File[]> {
  if (!dir) dir = await askForPath('MP4 dir');

  const files: Mp4File[] = [];
  const _files = fs.readdirSync(dir);
  _files.forEach((file, i) => {
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
  });

  console.log(`\nFound ${files.length} MP4 files...\n`);
  return files;
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
