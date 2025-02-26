import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// MongoDBを使用しないため、モデルのインポートをコメントアウト
// import Player from '../models/Player';

// モックプレイヤーデータ（開発用）
interface MockPlayer {
  _id: string;
  deviceId: string;
  nickname?: string;
  gameData: any;
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
declare global {
  namespace Express {
    interface Request {
      player?: any;
    }
  }
}

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
        gameData: {},
        lastLogin: new Date(),
        createdAt: new Date()
      };
      mockPlayers[deviceId] = player;
    }

    // 最終ログイン日時を更新
    player.lastLogin = new Date();

    // トークンを生成（型エラーを一時的に抑制）
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
    
    // TypeScript型エラーを一時的に回避するためのany型使用
    const token = (jwt as any).sign(
      { id: player._id },
      jwtSecret,
      { expiresIn }
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

    // トークンを検証（型エラーを一時的に抑制）
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = (jwt as any).verify(token, jwtSecret) as DecodedToken;

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