import { Scene } from 'phaser';
import { Unit, UnitManager } from './UnitManager';

interface MagicProjectile {
    sprite: Phaser.GameObjects.Arc; // 仮実装：後でSpriteに変更
    speed: number;
}

export class MagicSystem {
    private scene: Scene;
    private unitManager: UnitManager;
    private projectiles: MagicProjectile[] = [];
    private readonly projectileSpeed = 300;
    private readonly attackInterval = 1000; // ミリ秒
    private lastAttackTime = 0;

    constructor(scene: Scene, unitManager: UnitManager) {
        this.scene = scene;
        this.unitManager = unitManager;
    }

    update(time: number) {
        // 定期的に魔法を発射
        if (time > this.lastAttackTime + this.attackInterval) {
            this.shoot();
            this.lastAttackTime = time;
        }

        // 魔法の移動と衝突判定
        this.updateProjectiles();
    }

    private shoot() {
        const allyUnit = this.unitManager.getAllyUnit();
        if (!allyUnit) return;

        // 魔法弾を生成（青い小さな円）
        const projectile = this.scene.add.circle(
            allyUnit.position.x,
            allyUnit.position.y - 20,
            10,
            0x00ffff
        );

        // 発射エフェクト
        this.scene.tweens.add({
            targets: projectile,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true
        });

        this.projectiles.push({
            sprite: projectile,
            speed: this.projectileSpeed
        });
    }

    private updateProjectiles() {
        const enemyUnit = this.unitManager.getEnemyUnit();
        if (!enemyUnit) return;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // 上方向に移動
            projectile.sprite.y -= projectile.speed * this.scene.game.loop.delta / 1000;

            // 衝突判定
            if (this.checkCollision(projectile.sprite, enemyUnit)) {
                // ダメージ処理
                const defeated = this.unitManager.damageUnit(enemyUnit, 20);
                if (defeated) {
                    // 敵が倒された場合、BattleSceneに通知
                    this.scene.events.emit('enemyDefeated');
                }

                // 魔法弾を消去
                projectile.sprite.destroy();
                this.projectiles.splice(i, 1);
                continue;
            }

            // 画面外に出た場合は消去
            if (projectile.sprite.y < 0) {
                projectile.sprite.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    private checkCollision(projectile: Phaser.GameObjects.Arc, unit: Unit): boolean {
        const distance = Phaser.Math.Distance.Between(
            projectile.x,
            projectile.y,
            unit.position.x,
            unit.position.y
        );
        return distance < 30; // 仮の衝突判定範囲
    }

    destroy() {
        // 全ての魔法弾を消去
        this.projectiles.forEach(p => p.sprite.destroy());
        this.projectiles = [];
    }
}