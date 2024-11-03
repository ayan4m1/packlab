import type { PackageJson } from '@npmcli/package-json';

import { fileURLToPath } from 'url';
import { basename, dirname, resolve } from 'path';
import { parse, stringify } from 'yaml';
import { PathLike, existsSync } from 'fs';
import { satisfies, valid, validRange } from 'semver';
import { readFile, writeFile } from 'fs/promises';
import packageJsonModule from '@npmcli/package-json';
import { confirm } from '@inquirer/prompts';

export enum ModSources {
  Modrinth = 'modrinth',
  CurseForge = 'curseforge'
}

export enum ModLoaders {
  Forge = 'forge',
  Fabric = 'fabric',
  NeoForged = 'neoforged'
}

export enum MinecraftVersionType {
  Snapshot = 'snapshot',
  Release = 'release'
}

export enum VersionResolutionType {
  Manual = 'manual',
  Latest = 'latest',
  Interactive = 'interactive'
}

export type MinecraftVersion = {
  id: string;
  type: MinecraftVersionType;
  url: string;
  time: Date;
  releaseTime: Date;
};

export type MinecraftVersions = {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MinecraftVersion[];
};

export type PackFile = {
  name: string;
  author?: string;
  description?: string;
  url?: string;
  sources: string[];
  loaders: string[];
  versions: string[];
  mods: string[];
};

type ExecOptions = {
  executableFile: string;
};

type VersionSpecifier = {
  id: string;
  version: string;
};

const modpackFilePath = 'modpack.yml';

export const getInstallDirectory = (): string =>
  dirname(fileURLToPath(import.meta.url));

export const getPackageInfo = async (): Promise<PackageJson> =>
  (await packageJsonModule.load(resolve(getInstallDirectory(), '..')))?.content;

export const isModpackDirectory = (dir: PathLike = process.cwd()) =>
  existsSync(resolve(dir.toString('utf-8'), modpackFilePath));

export const getExecOptions = (...paths: string[]): ExecOptions => ({
  executableFile: `lib/commands/${paths.join('/')}`
});

export const getPackFilePath = (dir: string = process.cwd()) =>
  resolve(dir, 'packlab.yml');

export const readPackFile = async (dir?: string): Promise<PackFile> => {
  const path = getPackFilePath(dir);

  if (!existsSync(path)) {
    return null;
  }

  const contents = await readFile(path, 'utf-8');

  if (!contents.length) {
    return null;
  }

  return parse(contents) as unknown as PackFile;
};

export const writePackFile = async (
  dir: string,
  data: PackFile
): Promise<void> => {
  const path = getPackFilePath(dir);

  if (
    existsSync(path) &&
    !confirm({
      message: `${basename(path)} already exists, overwrite it?`,
      default: false
    })
  ) {
    console.warn(`Unwilling to overwrite ${path}`);
    return;
  }

  await writeFile(path, stringify(data), 'utf-8');
};

export const parseVersionString = (input: string): VersionSpecifier | null => {
  if (!input.includes('@')) {
    input += '@*';
  }

  const tokens = input.split('@');

  if (tokens.length !== 2) {
    console.warn(`Version specifier had multiple @ symbols: ${input}`);
    return null;
  }

  const [id, version] = tokens;

  if (!validRange(version)) {
    console.warn(`Version range is invalid: ${version}`);
    return null;
  }

  return { id, version };
};

export const findMatchingVersions = (
  expression: string,
  versions: VersionSpecifier[]
) => versions.filter(({ version }) => satisfies(version, expression));

export const findValidVersions = (versions: MinecraftVersions) =>
  versions.versions.filter(({ id }) => valid(id)).map(({ id }) => id);

export const getMinecraftVersionData = async () => {
  try {
    console.log('Fetching Minecraft version manifest from Mojang...');
    const versionReq = await fetch(
      'https://launchermeta.mojang.com/mc/game/version_manifest.json'
    );

    return (await versionReq.json()) as unknown as MinecraftVersions;
  } catch (error) {
    console.error('Failed to fetch Minecraft version manifest!');
    throw error;
  }
};
