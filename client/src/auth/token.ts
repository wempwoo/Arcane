import { initializeStorage } from './storage';
import { getDeviceId } from './device';
import { DeviceAuthenticationError } from './errors';

let currentToken: string | null = null;

export const getToken = async (): Promise<string | null> => {
  if (currentToken) return currentToken;
  
  const storage = await initializeStorage();
  return storage.get('token');
};

export const setToken = async (token: string): Promise<void> => {
  currentToken = token;
  const storage = await initializeStorage();
  await storage.set('token', token);
};

export const authenticate = async (): Promise<void> => {
  const deviceId = await getDeviceId();
  
  try {
    const response = await fetch('/api/auth/device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        deviceId, 
        deviceType: getDeviceType() 
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new DeviceAuthenticationError();
      }
      throw new Error('Authentication failed');
    }

    const { token } = await response.json();
    await setToken(token);
  } catch (error) {
    if (error instanceof DeviceAuthenticationError) {
      throw error;
    }
    throw new Error('Authentication failed');
  }
};

const getDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  return 'web';
};