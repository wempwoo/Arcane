/**
 * APIレスポンスの型定義
 */

export interface Player {
  id: string;
  deviceId: string;
  name: string | null;
  level: number;
  experience: number;
  gameData: GameData;
  lastLogin: string;  // ISO形式の日付文字列
  createdAt: string;  // ISO形式の日付文字列
  updatedAt: string;  // ISO形式の日付文字列
}

export interface AuthResponse {
  token: string;
  player: Player;
}

export interface ProfileResponse {
  data: Player;
}

export interface ProfileUpdateData {
  name?: string;
  level?: number;
  experience?: number;
}

export interface GameData {
  inventory: {
    items: {
      id: string;
      quantity: number;
    }[];
    gold: number;
  };
  progress: {
    completedQuests: string[];
    unlockedAreas: string[];
    currentArea: string;
  };
  stats: {
    playTime: number;
    battlesWon: number;
    battlesLost: number;
  };
}

export interface GameDataResponse {
  data: {
    gameData: GameData;
    lastSync: string;
  };
}

// ヘッダーとリクエストオプションの型
export type ApiHeaders = Record<string, string> & {
  'Content-Type': 'application/json';
  Authorization?: string;
};

export interface RequestOptions {
  method: string;
  headers: ApiHeaders;
  body?: string;
}