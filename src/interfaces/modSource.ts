import { Mod } from './mod.js';

export type ModSource = {
  name: string;
  description: string;
  url: string;
};

export interface ModSourceManager {
  source(): ModSource;
  mods(): Promise<Mod[]>;
  mod(id: string): Promise<Mod>;
}
