import { ModLoader } from './modLoader.js';

export type Mod = {
  id?: string;
  name: string;
  author: string;
  supportedLoaders: ModLoader[];
};
