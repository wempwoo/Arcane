import { initializeStorage } from './storage';
import { Device } from '@capacitor/device';

const generateBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const txt = 'arcane_game_device_id';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '16px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(txt, 4, 20);
  }
  
  return canvas.toDataURL();
};

export const getDeviceId = async (): Promise<string> => {
  const storage = await initializeStorage();
  const stored = await storage.get('deviceId');
  if (stored) return stored;

  let deviceId: string;
  try {
    // Capacitor Device APIを試行
    const info = await Device.getId();
    deviceId = info.identifier || generateBrowserFingerprint();
  } catch {
    // フォールバックとしてブラウザフィンガープリントを使用
    deviceId = generateBrowserFingerprint();
  }

  await storage.set('deviceId', deviceId);
  return deviceId;
};