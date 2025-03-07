import 'phaser';
import { BattleScene } from './scenes/BattleScene';
import { BuildScene } from './scenes/BuildScene';
import { ExplorationScene } from './scenes/ExplorationScene';
import { TitleScene } from './scenes/TitleScene';

// ゲーム設定
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 390,
    height: 844,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [TitleScene, ExplorationScene, BattleScene, BuildScene]
};

// ゲームインスタンスの作成
window.addEventListener('load', async () => {
    // ゲームインスタンスを作成
    new Phaser.Game(config);
});