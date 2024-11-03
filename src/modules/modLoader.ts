export type ModLoader = {
  name: string;
  description: string;
  url: string;
};

export type ModLoaderVersion = {
  loader: ModLoader;
  version: string;
  mcVersions: {
    min?: string;
    max?: string;
  };
};

export interface ModLoaderManager {
  loader(): ModLoader;
  versions(): Promise<ModLoaderVersion[]>;
  version(version: string): Promise<ModLoaderVersion>;
}
