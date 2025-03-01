import { Scene } from 'phaser';

import { MagicSystem } from './battle/MagicSystem';
import { UnitManager } from './battle/UnitManager';

export class BattleScene extends Scene {
    private battleResult: 'victory' | 'defeat' | null = null;
    private unitManager!: UnitManager;
    private magicSystem!: MagicSystem;

    constructor() {
        super({ key: 'BattleScene' });
    }

    create() {
        // 背景色を設定
        this.cameras.main.setBackgroundColor('#000033');

        // 戦闘エリアの境界線を描画
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x666666);

        // 味方ユニットエリア（下部）の境界線
        const allyAreaY = this.cameras.main.height * 0.8;
        graphics.lineBetween(0, allyAreaY, this.cameras.main.width, allyAreaY);

        // 敵ユニットエリア（上部）の境界線
        const enemyAreaY = this.cameras.main.height * 0.2;
        graphics.lineBetween(0, enemyAreaY, this.cameras.main.width, enemyAreaY);

        // ユニット管理システムの初期化
        this.unitManager = new UnitManager(this);

        // ユニットの配置
        this.unitManager.createAllyUnit(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.9
        );

        this.unitManager.createEnemyUnit(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.1
        );

        // 魔法システムの初期化
        this.magicSystem = new MagicSystem(this, this.unitManager);

        // 敵撃破時のイベントリスナー
        this.events.on('enemyDefeated', () => {
            this.endBattle('victory');
        });

        // フェードイン
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    private endBattle(result: 'victory' | 'defeat') {
        this.battleResult = result;
        
        // 各システムのクリーンアップ
        this.magicSystem.destroy();
        this.unitManager.cleanup();
        
        // フェードアウトしてから探索シーンへ
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('ExplorationScene', { battleResult: this.battleResult });
        });
    }

    update(time: number) {
        // 魔法システムの更新
        this.magicSystem.update(time);
    }
}