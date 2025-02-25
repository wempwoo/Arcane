import 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // アセットのロードはここで行います
    }

    create() {
        // ゲーム開始時の初期化処理
        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'タップしてスタート',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        );
        text.setOrigin(0.5);

        // 画面タップのイベントリスナー
        this.input.on('pointerdown', () => {
            text.setText('ゲームスタート！');
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