import { valid } from 'semver';
import { basename } from 'path';
import { existsSync } from 'fs';
import { input, checkbox, select } from '@inquirer/prompts';

import {
  getPackFilePath,
  ModLoaders,
  ModSources,
  PackFile,
  writePackFile,
  getMinecraftVersionData,
  VersionResolutionType,
  findValidVersions
} from '../utils.js';

try {
  if (existsSync(getPackFilePath())) {
    console.error(
      'A packlab.yml already exists in this directory. Please ensure you are in the right place.'
    );
    process.exit(1);
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

  const versionData = await getMinecraftVersionData();
  const versions = findValidVersions(versionData);

  let supportedVersions: string[] = [];

  while (!supportedVersions.length) {
    supportedVersions = await checkbox({
      message: 'Which game versions should be supported?',
      choices: versions
    });

    if (!supportedVersions.length) {
      console.warn('Must select at least one game version!');
    }
  }

  let sources: string[] = [];

  while (!sources.length) {
    sources = await checkbox({
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

  let loaders: string[] = [];
  const loaderVersions: Map<string, string> = new Map();

  while (!loaders.length) {
    loaders = await checkbox({
      message: 'Which mod loaders should be supported?',
      choices: Object.values(ModLoaders)
    });

    if (!loaders.length) {
      console.warn('Must select at least one mod loader!');
    }

    for (const loader of loaders) {
      const resolutionType = await select({
        message: `How would you like to provide the version of ${loader} to use?`,
        choices: [
          {
            value: VersionResolutionType.Manual,
            description: 'Manual entry'
          },
          {
            value: VersionResolutionType.Latest,
            description: 'Use latest for each game version'
          },
          {
            value: VersionResolutionType.Interactive,
            description: 'Browse loader versions for each game version'
          }
        ]
      });

      switch (resolutionType) {
        case VersionResolutionType.Manual:
          for (const supportedVersion of supportedVersions) {
            let version: string = '';

            while (!valid(version)) {
              version = await input({
                message: `Enter the version of ${loader} to use for Minecraft ${supportedVersion}`,
                required: true
              });
            }

            loaderVersions.set(loader, version);
          }
          break;
        case VersionResolutionType.Latest:
          // todo: look up list
          break;
        case VersionResolutionType.Interactive:
          // todo: look up list
          break;
      }
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
