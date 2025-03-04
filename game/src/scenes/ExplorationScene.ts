import Phaser from 'phaser';

import { HUD } from './exploration/HUD';
import { InputHandler } from './exploration/InputHandler';
import { MapGenerator } from './exploration/MapGenerator';
import { MapRenderer } from './exploration/MapRenderer';
import { Node, NodeType } from './exploration/types';

export class ExplorationScene extends Phaser.Scene {
    private mapGenerator!: MapGenerator;
    private mapRenderer!: MapRenderer;
    private inputHandler!: InputHandler;
    private map!: Map<string, Node>;
    private currentNode!: Node;
    private readonly maxLevel: number = 10;
    private hud!: HUD;
    private isInitialized: boolean = false;

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    public init(data: { battleResult?: 'victory' | 'defeat' }): void {
        // 戦闘シーンからの戻り時の処理
        if (data.battleResult === 'victory') {
            // 戦闘に勝利した場合、現在のノードを訪問済みにマーク
            if (this.currentNode) {
                this.currentNode.visited = true;
                // マップの状態を更新
                this.mapRenderer?.updateState(this.map, this.currentNode);
                this.inputHandler?.updateState(this.currentNode);
            }
        }
    }

    public create(): void {
        if (!this.isInitialized) {
            // 初回のみマップを生成
            this.mapGenerator = new MapGenerator(this.maxLevel);
            this.map = this.mapGenerator.generateMap();
            
            // 開始ノードを設定
            this.currentNode = this.mapGenerator.getNode(0, 1)!; // Lane.Center = 1
            this.currentNode.visited = true;
            
            this.isInitialized = true;
        }

        // レンダラーの初期化（毎回必要）
        this.mapRenderer = new MapRenderer(this, this.map, this.currentNode);
        this.mapRenderer.setupCamera(this, this.maxLevel);

        // 入力ハンドラーの初期化
        this.inputHandler = new InputHandler(
            this,
            this.mapRenderer,
            this.currentNode,
            this.handleNodeSelected.bind(this)
        );

        // HUDの初期化
        this.hud = new HUD(this);

        // マップの状態を更新（戦闘からの復帰時に必要）
        this.mapRenderer.updateState(this.map, this.currentNode);
        this.inputHandler.updateState(this.currentNode);

        // フェードイン開始
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // 初期描画
        this.mapRenderer.draw();
    }

    private handleNodeSelected(node: Node): void {
        // ノードの状態を更新
        this.currentNode = node;
        node.visited = true;

        // 戦闘ノードの場合、戦闘シーンに遷移
        if (node.type === NodeType.Battle) {
            // フェードアウトしてから戦闘シーンへ
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('BattleScene');
            });
            return;
        }

        // コンポーネントの状態を更新
        this.mapRenderer.updateState(this.map, this.currentNode);
        this.inputHandler.updateState(this.currentNode);

        // マップを再描画
        this.mapRenderer.draw();
    }
}