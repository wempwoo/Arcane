import Phaser from 'phaser';

import { HUD } from './exploration/HUD';
import { InputHandler } from './exploration/InputHandler';
import { MapRenderer } from './exploration/MapRenderer';
import { Action, Node, NodeType, ExplorationMapData, ExplorationNodeData, convertBackendNode } from './exploration/types';
import { ActionSelector } from './exploration/ActionSelector';
import { ExplorationMapAPI } from './exploration/api';

export class ExplorationScene extends Phaser.Scene {
    private mapRenderer!: MapRenderer;
    private inputHandler!: InputHandler;
    private map!: Map<string, Node>;
    private currentNode!: Node;
    private readonly maxLevel: number = 10;
    private hud!: HUD;
    private actionSelector!: ActionSelector;
    private isInitialized: boolean = false;
    private loadingText?: Phaser.GameObjects.Text;
    private errorText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    public init(data: { battleResult?: 'victory' | 'defeat' }): void {
        // 戦闘シーンからの戻り時の処理
        if (data.battleResult === 'victory' && this.currentNode) {
            // 戦闘に勝利した場合、現在のノードを訪問済みにマーク
            this.currentNode.visited = true;
            // マップの状態を更新
            this.mapRenderer?.updateState(this.map, this.currentNode);
            this.inputHandler?.updateState(this.currentNode);
        }
    }

    private async initializeMap(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                // ローディングテキストを表示
                const centerX = this.cameras.main.centerX;
                const centerY = this.cameras.main.centerY;
                
                this.loadingText = this.add.text(centerX, centerY, 'マップを生成中...', {
                    fontSize: '24px',
                    color: '#ffffff'
                }).setOrigin(0.5).setDepth(1000);

                // バックエンドでマップを生成
                const mapData = await ExplorationMapAPI.generateMap(this.maxLevel);

                // ノードデータのマップを作成
                const nodeMap = new Map<number, ExplorationNodeData>();
                mapData.nodes.forEach(nodeData => {
                    nodeMap.set(nodeData.id, nodeData);
                });

                // マップデータを内部形式に変換
                this.map = new Map();
                mapData.nodes.forEach(nodeData => {
                    const node = convertBackendNode(nodeData, nodeMap);
                    this.map.set(`${node.level},${node.lane}`, node);
                });

                // 開始ノードを設定
                this.currentNode = this.getNode(0, 1)!; // Lane.Center = 1
                this.currentNode.visited = true;
                
                this.isInitialized = true;
            }
            return true;
        } catch (error) {
            console.error('Failed to generate map:', error);
            return false;
        }
    }

    public async create(): Promise<void> {
        // マップの初期化（初回のみ）
        if (!this.isInitialized) {
            const success = await this.initializeMap();
            if (!success) {
                const centerX = this.cameras.main.centerX;
                const centerY = this.cameras.main.centerY;
                this.errorText = this.add.text(centerX, centerY, 'マップの生成に失敗しました。\nタイトルに戻ります。', {
                    fontSize: '16px',
                    color: '#ff0000'
                }).setOrigin(0.5).setDepth(1000);
                
                // 3秒後にタイトルに戻る
                this.time.delayedCall(3000, () => {
                    this.scene.start('TitleScene');
                });
                return;
            }
            this.loadingText?.destroy();
        }

        // レンダラーの初期化
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

        // 行動選択UIの初期化
        this.actionSelector = new ActionSelector(this);

        // マップの状態を更新（別シーンからの復帰時に必要）
        this.mapRenderer.updateState(this.map, this.currentNode);
        this.inputHandler.updateState(this.currentNode);

        // 現在のノードの位置にカメラを移動
        const cameraY = this.mapRenderer.calculateCameraY(this.currentNode) - 420; // なぜか420ずらすとちょうどいい
        this.cameras.main.setScroll(0, cameraY);

        // フェードイン開始
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // 初期描画
        this.mapRenderer.draw();
    }

    private getNode(level: number, lane: number): Node | undefined {
        return this.map.get(`${level},${lane}`);
    }

    private handleNodeSelected(node: Node): void {
        // ノードの状態を更新
        this.currentNode = node;

        // コンポーネントの状態を更新
        this.mapRenderer.updateState(this.map, this.currentNode);
        this.inputHandler.updateState(this.currentNode);

        // マップを再描画
        this.mapRenderer.draw();

        // 行動選択UIを表示（戦闘ノードまたは安全地帯の場合）
        if (node.type === NodeType.Battle || node.type === NodeType.SafeHaven) {
            this.inputHandler.disableInput(); // 入力を無効化
            this.actionSelector.show(node, (action: Action) => {
                this.handleActionSelected(action);
            });
        } else {
            // 基本ノードの場合は即座に訪問済みにする
            node.visited = true;
            this.mapRenderer.updateState(this.map, this.currentNode);
        }
    }

    private handleActionSelected(action: Action): void {
        console.log(`Selected action: ${action.id}`);

        // 行動選択UIを非表示
        this.actionSelector.hide();
        this.inputHandler.enableInput(); // 入力を再度有効化

        switch (action.id) {
            case 'fight':
                // 戦闘シーンに遷移
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('BattleScene');
                });
                break;

            case 'sneak':
                // すり抜け成功時の処理
                this.currentNode.visited = true;
                this.mapRenderer.updateState(this.map, this.currentNode);
                break;

            case 'build':
                // ビルドシーンに遷移
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('BuildScene');
                });

            case 'do_nothing':
                // 何もしない
                break;
        }
    }
}