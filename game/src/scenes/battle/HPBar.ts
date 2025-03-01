import { Scene } from 'phaser';
import { Unit } from './UnitManager';

export class HPBar {
    private scene: Scene;
    private barWidth: number = 60;
    private barHeight: number = 8;
    private border: Phaser.GameObjects.Graphics;
    private fill: Phaser.GameObjects.Graphics;

    constructor(scene: Scene) {
        this.scene = scene;
        this.border = scene.add.graphics();
        this.fill = scene.add.graphics();
    }

    update(unit: Unit) {
        const x = unit.position.x - this.barWidth / 2;
        const y = unit.position.y - 30; // ユニットの上部にHPバーを表示

        // HPバーの枠を描画
        this.border.clear();
        this.border.lineStyle(1, 0xffffff);
        this.border.strokeRect(x, y, this.barWidth, this.barHeight);

        // HPバーの中身を描画
        this.fill.clear();
        const hpRatio = unit.hp / unit.maxHp;
        const fillWidth = this.barWidth * hpRatio;
        
        // HPに応じて色を変更（緑→黄→赤）
        const color = this.getHPColor(hpRatio);
        
        this.fill.fillStyle(color);
        this.fill.fillRect(x, y, fillWidth, this.barHeight);
    }

    private getHPColor(ratio: number): number {
        if (ratio > 0.6) return 0x00ff00; // 緑
        if (ratio > 0.3) return 0xffff00; // 黄
        return 0xff0000; // 赤
    }

    destroy() {
        this.border.destroy();
        this.fill.destroy();
    }
}