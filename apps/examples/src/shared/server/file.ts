import {FileHandle, readFile as fsReadFile, writeFile as fsWriteFile} from 'fs/promises';
import {PathLike} from 'node:fs';

export async function readFile<T>(path: PathLike | FileHandle) {
  const data = await fsReadFile(path, {encoding: 'utf-8'});
  return JSON.parse(data) as T;
}

export async function writeFile(path: PathLike | FileHandle, data: string | object) {
  return fsWriteFile(path, typeof data === 'string' ? data : JSON.stringify(data));
}
