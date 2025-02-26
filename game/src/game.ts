import 'phaser';
import apiService from './services/api';

// プレイヤーデータ用のインターフェース
interface PlayerData {
  id: string;
  nickname?: string;
  gameData: any;
  lastLogin: Date;
  createdAt: Date;
}

// ゲームデータを管理するグローバルオブジェクト
const GameManager = {
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

class MainScene extends Phaser.Scene {
    private playerText?: Phaser.GameObjects.Text;
    private startText?: Phaser.GameObjects.Text;
    
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // アセットのロードはここで行います
    }

    async create() {
        // ゲーム開始時の初期化処理
        this.startText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'ゲームデータを読み込み中...',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        );
        this.startText.setOrigin(0.5);
        
        // プレイヤー情報表示用テキスト
        this.playerText = this.add.text(
            20,
            20,
            'プレイヤー: 未認証',
            {
                fontSize: '16px',
                color: '#ffffff'
            }
        );
        
        // プレイヤー認証
        try {
            await GameManager.authenticate();
            
            // 認証成功
            if (GameManager.player) {
                // プレイヤー情報の表示
                const nickname = GameManager.player.nickname || 'ゲスト';
                this.playerText.setText(`プレイヤー: ${nickname} (ID: ${GameManager.player.id.substring(0, 8)}...)`);
                
                // スタートメッセージの更新
                this.startText.setText('タップしてスタート');
            } else {
                this.startText.setText('認証に失敗しました。再試行してください。');
            }
        } catch (error) {
            console.error('初期化エラー:', error);
            this.startText.setText('エラーが発生しました。再試行してください。');
        }

        // 画面タップのイベントリスナー
        this.input.on('pointerdown', () => {
            if (GameManager.player) {
                this.startText!.setText('ゲームスタート！');
                
                // ゲームデータを同期する例
                const demoGameData = {
                    lastPlayed: new Date().toISOString(),
                    score: Math.floor(Math.random() * 1000),
                    level: 1
                };
                
                // サーバーと同期
                GameManager.syncGameData(demoGameData);
            }
        });
    }

    update() {
        // ゲームの更新処理はここに書きます
    }
}

// ゲーム設定
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300, x: 0 },
            debug: false
        }
    },
    scene: MainScene
};

// ゲームインスタンスの作成
window.addEventListener('load', () => {
    new Phaser.Game(config);
});