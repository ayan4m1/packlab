import { valid } from 'semver';
import { basename } from 'path';
import { existsSync } from 'fs';
import { input, checkbox } from '@inquirer/prompts';

import {
  getPackFilePath,
  ModLoaders,
  ModSources,
  PackFile,
  MinecraftVersions,
  writePackFile,
  MinecraftVersionType
} from '../utils.js';

try {
  if (existsSync(getPackFilePath())) {
    console.error(
      'A packlab.yml already exists in this directory. Please ensure you are in the right place.'
    );
    process.exit(0);
  }

  const dirName = basename(process.cwd());
  const name = await input({
    message: 'What is the modpack name?',
    required: true,
    default: dirName
  });
  const author = await input({
    message: 'Who is the modpack author?'
  });
  const description = await input({
    message: 'Enter a short description, if desired.'
  });
  const url = await input({
    message: 'Enter a URL, if available.'
  });

  const versionReq = await fetch(
    'https://launchermeta.mojang.com/mc/game/version_manifest.json'
  );
  const versionData = (await versionReq.json()) as unknown as MinecraftVersions;

  const versions = versionData.versions
    .filter(
      (version) =>
        version.type === MinecraftVersionType.Release && valid(version.id)
    )
    .map((version) => version.id);

  let supportedVersions = [];

  while (!supportedVersions.length) {
    supportedVersions = await checkbox<string>({
      message: 'Which game versions should be supported?',
      choices: versions
    });

    if (!supportedVersions.length) {
      console.warn('Must select at least one game version!');
    }
  }

  let sources = [];

  while (!sources.length) {
    sources = await checkbox<string>({
      message: 'Which mod sources should be used?',
      choices: Object.values(ModSources).map((sourceName: string) => ({
        name: sourceName,
        value: sourceName,
        checked: sourceName === ModSources.Modrinth
      }))
    });

    if (!sources.length) {
      console.warn('Must select at least one mod source!');
    }
  }

  let loaders = [];

  while (!loaders.length) {
    loaders = await checkbox<string>({
      message: 'Which mod loaders should be supported?',
      choices: Object.values(ModLoaders)
    });

    if (!loaders.length) {
      console.warn('Must select at least one mod loader!');
    }
  }

  const newPackFile: PackFile = {
    name,
    author,
    description,
    url,
    sources,
    versions,
    loaders,
    mods: []
  };

  await writePackFile(process.cwd(), newPackFile);
} catch (error) {
  console.error(error);
  process.exit(1);
}
