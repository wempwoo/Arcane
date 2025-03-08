import { Preferences } from '@capacitor/preferences';
import { StorageStrategy } from './types';

export class NativeStorage implements StorageStrategy {
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }
}