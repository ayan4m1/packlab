import { Command, program } from 'commander';

import {
  getPackageInfo,
  getInstallDirectory,
  getExecOptions
} from './utils.js';

try {
  const { name, version, description } = await getPackageInfo();

  console.dir(getInstallDirectory());

  await program
    .name(name)
    .version(version)
    .description(description)
    .executableDir(getInstallDirectory())
    .command('init', 'Creates a new modpack', getExecOptions('init'))
    .command(
      'version <bumpType>',
      'Increment the modpack version',
      getExecOptions('version')
    )
    .command('pack', 'Packages modpack for release', getExecOptions('pack'))
    .command(
      'update',
      'Update modpack dependency versions',
      getExecOptions('upgrade')
    )
    .command(
      'retarget <gameVersion>',
      'Changes target MC version',
      getExecOptions('retarget')
    )
    .addCommand(
      new Command('sources')
        .description('Manipulate sources in the current modpack')
        .command(
          'list',
          'List available data sources',
          getExecOptions('sources', 'list')
        )
        .command(
          'add <source>',
          'Adds a source to the current pack',
          getExecOptions('sources', 'add')
        )
        .command(
          'remove <source>',
          'Removes a source from the current pack',
          getExecOptions('sources', 'remove')
        )
    )
    .addCommand(
      new Command('loaders')
        .description('Manipulate loaders in the current modpack')
        .command(
          'list',
          'List available mod loaders',
          getExecOptions('loaders', 'list')
        )
        .command(
          'add <loader>',
          'Adds a loader to the current pack',
          getExecOptions('loaders', 'add')
        )
        .command(
          'remove <loader>',
          'Removes a loader from the current pack',
          getExecOptions('loaders', 'remove')
        )
    )
    .addCommand(
      new Command('mods')
        .executableDir(getInstallDirectory())
        .description('Manipulate mods in the current modpack')
        .command('list', 'List available mods', getExecOptions('mods', 'list'))
        .command(
          'add <mod>',
          'Adds a mod to the current pack',
          getExecOptions('mods', 'add')
        )
        .command(
          'remove <mod>',
          'Removes a mod from the current pack',
          getExecOptions('mods', 'remove')
        )
        .command(
          'update <mod>',
          'Update a mod in the current pack',
          getExecOptions('mods', 'upgrade')
        )
    )
    .parseAsync();
} catch (error) {
  console.error(error);
  process.exit(1);
}
