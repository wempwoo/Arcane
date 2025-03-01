import { Scene } from 'phaser';
import { HPBar } from './HPBar';

export interface Unit {
    sprite: Phaser.GameObjects.Arc; // 仮実装：後でSpriteに変更
    hp: number;
    maxHp: number;
    position: {
        x: number;
        y: number;
    };
    hpBar: HPBar;
}

export class UnitManager {
    private scene: Scene;
    private allyUnit: Unit | null = null;
    private enemyUnit: Unit | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    createAllyUnit(x: number, y: number): Unit {
        const sprite = this.scene.add.circle(x, y, 20, 0x0000ff);
        const hpBar = new HPBar(this.scene);
        this.allyUnit = {
            sprite,
            hp: 100,
            maxHp: 100,
            position: { x, y },
            hpBar
        };
        hpBar.update(this.allyUnit);
        return this.allyUnit;
    }

    createEnemyUnit(x: number, y: number): Unit {
        const sprite = this.scene.add.circle(x, y, 20, 0xff0000);
        const hpBar = new HPBar(this.scene);
        this.enemyUnit = {
            sprite,
            hp: 100,
            maxHp: 100,
            position: { x, y },
            hpBar
        };
        hpBar.update(this.enemyUnit);
        return this.enemyUnit;
    }

    damageUnit(unit: Unit, damage: number): boolean {
        unit.hp = Math.max(0, unit.hp - damage);
        
        // HPバーを更新
        unit.hpBar.update(unit);
        
        // ダメージを受けた時の視覚的なフィードバック
        this.scene.tweens.add({
            targets: unit.sprite,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });

        // HPが0になったかどうかを返す
        return unit.hp <= 0;
    }

    getAllyUnit(): Unit | null {
        return this.allyUnit;
    }

    getEnemyUnit(): Unit | null {
        return this.enemyUnit;
    }

    cleanup() {
        // ユニットとHPBarを破棄
        if (this.allyUnit) {
            this.allyUnit.sprite.destroy();
            this.allyUnit.hpBar.destroy();
        }
        if (this.enemyUnit) {
            this.enemyUnit.sprite.destroy();
            this.enemyUnit.hpBar.destroy();
        }
        this.allyUnit = null;
        this.enemyUnit = null;
    }
}