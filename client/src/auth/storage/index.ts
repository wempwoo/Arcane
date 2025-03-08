import { WebStorage } from './web';
import { NativeStorage } from './native';
import { StorageStrategy } from './types';
import { Preferences } from '@capacitor/preferences';

export const initializeStorage = async (): Promise<StorageStrategy> => {
  try {
    // Capacitor Preferences APIが利用可能か確認
    await Preferences.get({ key: 'test' });
    return new NativeStorage();
  } catch {
    return new WebStorage();
  }
};