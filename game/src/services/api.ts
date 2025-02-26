/**
 * バックエンドAPIとの通信を管理するサービス
 */

// APIの基本URL（開発環境と本番環境で切り替え）
const API_BASE_URL = 'http://localhost:5000/api';

// ローカルストレージのキー
const TOKEN_KEY = 'arcane_auth_token';
const DEVICE_ID_KEY = 'arcane_device_id';

/**
 * デバイスIDの取得または生成
 */
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  // デバイスIDがない場合は新しく生成
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
};

/**
 * ユニークなデバイスIDを生成
 */
const generateDeviceId = (): string => {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 認証トークンの取得
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 認証トークンの保存
 */
const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 認証トークンの削除
 */
const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * APIリクエストのオプション作成
 */
const createRequestOptions = (
  method: string,
  data?: any,
  requireAuth: boolean = false
): RequestInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 認証が必要な場合はトークンを追加
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  // データがある場合はJSONに変換
  if (data) {
    options.body = JSON.stringify(data);
  }

  return options;
};

/**
 * 認証および新規登録
 */
const authenticate = async (): Promise<any> => {
  try {
    const deviceId = getDeviceId();
    const response = await fetch(
      `${API_BASE_URL}/players/auth`, 
      createRequestOptions('POST', { deviceId })
    );
    
    if (!response.ok) {
      throw new Error('認証に失敗しました');
    }
    
    const data = await response.json();
    
    // トークンを保存
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data.player;
  } catch (error) {
    console.error('認証エラー:', error);
    throw error;
  }
};

/**
 * プロファイル取得
 */
const getProfile = async (): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/players/profile`, 
      createRequestOptions('GET', null, true)
    );
    
    if (!response.ok) {
      throw new Error('プロファイルの取得に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('プロファイル取得エラー:', error);
    throw error;
  }
};

/**
 * プロファイル更新
 */
const updateProfile = async (profileData: any): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/players/profile`,
      createRequestOptions('PUT', profileData, true)
    );
    
    if (!response.ok) {
      throw new Error('プロファイルの更新に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('プロファイル更新エラー:', error);
    throw error;
  }
};

/**
 * ゲームデータ同期
 */
const syncGameData = async (gameData: any): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/players/sync`,
      createRequestOptions('POST', { gameData }, true)
    );
    
    if (!response.ok) {
      throw new Error('ゲームデータの同期に失敗しました');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('ゲームデータ同期エラー:', error);
    throw error;
  }
};

// APIサービスのエクスポート
export default {
  getDeviceId,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  authenticate,
  getProfile,
  updateProfile,
  syncGameData
};