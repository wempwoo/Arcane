import Phaser from 'phaser';

export class HUD {
    private scene: Phaser.Scene;
    private topHUD!: Phaser.GameObjects.Container;
    private bottomHUD!: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.initialize();
    }

    private initialize() {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        // 上部HUD
        this.topHUD = this.scene.add.container(100, 20);
        this.topHUD.setScrollFactor(0);
        this.topHUD.setSize(screenWidth, 60);
        const topBg = this.scene.add.rectangle(0, 0, screenWidth, 60, 0x333333);
        const topText = this.scene.add.text(0, 0, "Floor 1 - Dungeon", {
            fontSize: '24px',
            color: '#ffffff'
        });
        Phaser.Display.Align.In.TopLeft(topBg, this.topHUD);
        Phaser.Display.Align.In.TopLeft(topText, topBg);
        this.topHUD.add([topBg, topText]);

        // 下部HUD
        this.bottomHUD = this.scene.add.container(screenWidth / 2, screenHeight);
        const bottomBg = this.scene.add.rectangle(0, -60, screenWidth, 120, 0x333333);
        const bottomText = this.scene.add.text(-screenWidth/2 + 10, -110, "Status: Exploring", {
            fontSize: '20px',
            color: '#ffffff'
        });
        this.bottomHUD.add([bottomBg, bottomText]);
        this.bottomHUD.setScrollFactor(0);
        // ヒットエリアのサイズを設定し、インタラクティブにする
        const hitArea = new Phaser.Geom.Rectangle(-screenWidth / 2, -120, screenWidth, 120);
        this.bottomHUD.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // クリックイベントの登録
        this.bottomHUD.on('pointerdown', () => {
            console.log('bottomHUDがクリックされました！');
            // ここにクリック時の処理を記述
        });
    }

    // 現在のフロア情報を更新
    updateFloor(floor: number) {
        const text = this.topHUD.getAt(1) as Phaser.GameObjects.Text;
        text.setText(`Floor ${floor} - Dungeon`);
    }

    // ステータス情報を更新
    updateStatus(status: string) {
        const text = this.bottomHUD.getAt(1) as Phaser.GameObjects.Text;
        text.setText(`Status: ${status}`);
    }
}