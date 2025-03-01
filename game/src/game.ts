import 'phaser';
import apiService from './services/api';
import { TitleScene } from './scenes/TitleScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { BattleScene } from './scenes/BattleScene';

// プレイヤーデータ用のインターフェース
interface PlayerData {
  id: string;
  nickname?: string;
  gameData: any;
  lastLogin: Date;
  createdAt: Date;
}

// ゲームデータを管理するグローバルオブジェクト
export const GameManager = {
  player: null as PlayerData | null,
  
  // プレイヤー認証
  async authenticate(): Promise<PlayerData | null> {
    try {
      this.player = await apiService.authenticate();
      console.log('認証成功:', this.player);
      return this.player;
    } catch (error) {
      console.error('認証エラー:', error);
      return null;
    }
  },
  
  // ゲームデータ同期
  async syncGameData(gameData: any): Promise<void> {
    try {
      const updated = await apiService.syncGameData(gameData);
      if (this.player) {
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
    scene: [TitleScene, ExplorationScene, BattleScene]
};

// ゲームインスタンスの作成
window.addEventListener('load', async () => {
    // ゲーム起動前に認証を実行
    await GameManager.authenticate();
    
    // ゲームインスタンスを作成
    new Phaser.Game(config);
});