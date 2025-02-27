import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // 画面の中央座標を取得
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // タイトルテキストを追加
        this.add.text(centerX, centerY - 50, 'Arcane', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // タップガイドを追加
        this.add.text(centerX, centerY + 50, 'タップしてスタート', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 画面全体にクリック/タップ判定を追加
        this.input.on('pointerdown', () => {
            // フェードアウトしながらExplorationSceneに遷移
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('ExplorationScene');
            });
        });

        // シーン開始時にフェードイン
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
}