import { Scene } from 'phaser';

export class BuildScene extends Scene {
    constructor() {
        super({ key: 'BuildScene' });
    }

    create() {
        // 一時的な背景テキスト
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'ビルドシーン\n（開発中）',
            {
                fontSize: '32px',
                color: '#ffffff',
            }
        ).setOrigin(0.5);

        // 戻るボタン
        const backButton = this.add.text(
            100,
            50,
            '← 探索に戻る',
            {
                fontSize: '24px',
                color: '#ffffff',
            }
        ).setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.start('ExplorationScene');
        });
    }
}