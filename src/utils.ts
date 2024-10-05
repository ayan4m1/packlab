import type { PackageJson } from '@npmcli/package-json';

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { PathLike, existsSync } from 'fs';
import packageJsonModule from '@npmcli/package-json';

type ExecOptions = {
  executableFile: string;
};

const modpackFilePath = 'modpack.yml';

export const getInstallDirectory = (): string =>
  dirname(fileURLToPath(import.meta.url));

const getPackageJsonPath = (): string => resolve(getInstallDirectory(), '..');

export const getPackageInfo = async (): Promise<PackageJson> =>
  (await packageJsonModule.load(getPackageJsonPath()))?.content;

export const isModpackDirectory = (dir: PathLike = process.cwd()) =>
  existsSync(resolve(dir.toString('utf-8'), modpackFilePath));

export const getExecOptions = (...paths: string[]): ExecOptions => ({
  executableFile: `lib/commands/${paths.join('/')}`
});
