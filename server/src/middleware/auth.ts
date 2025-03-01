import { Request, Response, NextFunction } from 'express';
import { Secret, SignOptions, sign, verify } from 'jsonwebtoken';

// ゲームデータの型定義
interface GameData {
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

// モックプレイヤーデータ（開発用）
interface MockPlayer {
  _id: string;
  deviceId: string;
  nickname?: string;
  gameData: GameData;
  lastLogin: Date;
  createdAt: Date;
}

// インメモリデータストア（開発用）
const mockPlayers: Record<string, MockPlayer> = {};

// 認証トークンの型を拡張
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// リクエストプレイヤーの型を拡張
declare module 'express-serve-static-core' {
  interface Request {
    player?: MockPlayer;
  }
}

// 30日をセカンドに変換
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

// デバイスIDによる認証（開発版）
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { deviceId } = req.body;

    // デバイスIDが提供されていない場合
    if (!deviceId) {
      res.status(400).json({ message: 'デバイスIDが必要です' });
      return;
    }

    // 既存のプレイヤーを検索、または新規作成
    let player = mockPlayers[deviceId];
    
    if (!player) {
      // 新しいプレイヤーを作成
      const playerId = `player_${Object.keys(mockPlayers).length + 1}`;
      player = {
        _id: playerId,
        deviceId,
        gameData: {
          inventory: {
            items: [],
            gold: 0
          },
          progress: {
            completedQuests: [],
            unlockedAreas: [],
            currentArea: 'start'
          },
          stats: {
            playTime: 0,
            battlesWon: 0,
            battlesLost: 0
          }
        },
        lastLogin: new Date(),
        createdAt: new Date()
      };
      mockPlayers[deviceId] = player;
    }

    // 最終ログイン日時を更新
    player.lastLogin = new Date();

    // トークンを生成
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const options: SignOptions = { 
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || String(THIRTY_DAYS_IN_SECONDS))
    };
    
    const token = sign(
      { id: player._id },
      jwtSecret as Secret,
      options
    );

    // リクエストにプレイヤー情報を追加
    req.player = player;
    
    // レスポンスにトークンを設定
    res.locals.token = token;
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

// トークンによる保護ルートのミドルウェア（開発版）
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Authorizationヘッダーからトークンを取得
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // トークンが存在しない場合
    if (!token) {
      res.status(401).json({ message: '認証が必要です' });
      return;
    }

    // トークンを検証
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = verify(token, jwtSecret as Secret) as DecodedToken;

    // プレイヤーをIDで検索（モックデータから）
    const player = Object.values(mockPlayers).find(p => p._id === decoded.id);
    
    if (!player) {
      res.status(401).json({ message: 'プレイヤーが見つかりません' });
      return;
    }

    // リクエストにプレイヤー情報を追加
    req.player = player;
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(401).json({ message: '認証に失敗しました' });
  }
};