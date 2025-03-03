import 'phaser';
import { BattleScene } from './scenes/BattleScene';
import { BuildScene } from './scenes/BuildScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { TitleScene } from './scenes/TitleScene';
import apiService from './services/api';
import { GameData, Player } from './services/types';

// プレイヤーデータ用のインターフェース
interface PlayerData extends Omit<Player, 'lastLogin' | 'createdAt' | 'updatedAt'> {
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ゲームデータを管理するグローバルオブジェクト
export const GameManager = {
  player: null as PlayerData | null,
  
  // プレイヤー認証
  async authenticate(): Promise<PlayerData | null> {
    try {
      const playerData = await apiService.authenticate();
      if (playerData) {
        // 日付文字列をDateオブジェクトに変換
        this.player = {
          ...playerData,
          lastLogin: new Date(playerData.lastLogin),
          createdAt: new Date(playerData.createdAt),
          updatedAt: new Date(playerData.updatedAt)
        };
      }
      console.log('認証成功:', this.player);
      return this.player;
    } catch (error) {
      console.error('認証エラー:', error);
      return null;
    }
  },
  
  // ゲームデータ同期
  async syncGameData(gameData: GameData): Promise<void> {
    try {
      const updated = await apiService.syncGameData(gameData);
      if (this.player && updated) {
        this.player.gameData = updated.gameData;
      }
      console.log('ゲームデータ同期成功');
    } catch (error) {
      console.error('ゲームデータ同期エラー:', error);
    }
  }
};

// ゲーム設定
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 390,
    height: 844,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [TitleScene, ExplorationScene, BattleScene, BuildScene]
};

// ゲームインスタンスの作成
window.addEventListener('load', async () => {
    // ゲーム起動前に認証を実行
    await GameManager.authenticate();
    
    // ゲームインスタンスを作成
    new Phaser.Game(config);
});