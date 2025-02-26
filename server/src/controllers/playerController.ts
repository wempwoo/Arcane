import { Request, Response } from 'express';
// MongoDBを使用しないため、モデルのインポートをコメントアウト
// import Player from '../models/Player';

/**
 * プレイヤープロファイルの取得
 * @route GET /api/players/profile
 * @access Private
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const player = req.player;

    if (!player) {
      res.status(404).json({ message: 'プレイヤーが見つかりません' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: player._id,
        deviceId: player.deviceId,
        nickname: player.nickname,
        gameData: player.gameData,
        lastLogin: player.lastLogin,
        createdAt: player.createdAt
      }
    });
  } catch (error) {
    console.error('プロファイル取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

/**
 * プレイヤープロファイルの更新
 * @route PUT /api/players/profile
 * @access Private
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname, gameData } = req.body;
    const player = req.player;
    
    // 更新するフィールドを適用
    if (nickname !== undefined) {
      player.nickname = nickname;
    }
    
    if (gameData !== undefined) {
      // 既存のゲームデータとマージ
      player.gameData = {
        ...player.gameData,
        ...gameData
      };
    }
    
    // 更新日時を設定
    player.lastLogin = new Date();
    
    res.status(200).json({
      success: true,
      data: {
        id: player._id,
        deviceId: player.deviceId,
        nickname: player.nickname,
        gameData: player.gameData,
        lastLogin: player.lastLogin,
        createdAt: player.createdAt
      }
    });
  } catch (error) {
    console.error('プロファイル更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};

/**
 * ゲームデータの同期
 * @route POST /api/players/sync
 * @access Private
 */
export const syncGameData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameData } = req.body;
    const player = req.player;
    
    if (!gameData) {
      res.status(400).json({ message: 'ゲームデータが必要です' });
      return;
    }
    
    // ゲームデータを更新
    player.gameData = gameData;
    player.lastLogin = new Date();
    
    res.status(200).json({
      success: true,
      data: {
        id: player._id,
        gameData: player.gameData,
        lastLogin: player.lastLogin
      }
    });
  } catch (error) {
    console.error('ゲームデータ同期エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
};