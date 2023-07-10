import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import NodeID3 from 'node-id3';

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

export const getMp3Files = async function (dir: string = ''): Promise<string[]> {
  if (!dir) dir = await askForPath('MP3 dir');

  const files: string[] = [];
  const _files = fs.readdirSync(dir);
  _files.forEach((file, i) => {
    const p2f = path.join(dir, file);
    if (fs.lstatSync(p2f).isDirectory()) return;
    if (file.startsWith('_') || file.startsWith('.')) return;
    if (path.extname(p2f) !== '.mp3') return;
    files.push(p2f);
  });

  console.log(`\nFound ${files.length} MP3 files...\n`);
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
