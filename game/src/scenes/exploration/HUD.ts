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
        this.topHUD = this.scene.add.container(screenWidth / 2, 0);
        const topBg = this.scene.add.rectangle(0, 30, screenWidth, 60, 0x333333);
        const topText = this.scene.add.text(-screenWidth/2 + 10, 10, "Floor 1 - Dungeon", {
            fontSize: '24px',
            color: '#ffffff'
        });
        this.topHUD.add([topBg, topText]);
        this.topHUD.setScrollFactor(0);

        // 下部HUD
        this.bottomHUD = this.scene.add.container(screenWidth / 2, screenHeight);
        const bottomBg = this.scene.add.rectangle(0, -60, screenWidth, 120, 0x333333);
        const bottomText = this.scene.add.text(-screenWidth/2 + 10, -110, "Status: Exploring", {
            fontSize: '20px',
            color: '#ffffff'
        });
        this.bottomHUD.add([bottomBg, bottomText]);
        this.bottomHUD.setScrollFactor(0);
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