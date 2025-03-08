import { authenticate, getToken } from '../auth/token';
import { DeviceAuthenticationError } from '../auth/errors';

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authenticatedRequest = async (
  endpoint: string, 
  options: RequestOptions = {}
): Promise<Response> => {
  try {
    const token = await getToken();
    if (!token) {
      await authenticate();
    }

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${await getToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      try {
        await authenticate();
        return fetch(endpoint, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${await getToken()}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        if (error instanceof DeviceAuthenticationError) {
          // デバイス認証エラーの場合は処理を中断
          throw error;
        }
        throw new Error('Authentication failed');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof DeviceAuthenticationError) {
      // デバイス認証エラーの場合は処理を中断
      throw error;
    }
    throw error;
  }
};