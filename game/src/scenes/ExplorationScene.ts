import Phaser from 'phaser';
import { Node } from './exploration/types';
import { MapGenerator } from './exploration/MapGenerator';
import { MapRenderer } from './exploration/MapRenderer';
import { InputHandler } from './exploration/InputHandler';

export class ExplorationScene extends Phaser.Scene {
    private mapGenerator!: MapGenerator;
    private mapRenderer!: MapRenderer;
    private inputHandler!: InputHandler;
    private map!: Map<string, Node>;
    private currentNode!: Node;
    private readonly maxLevel: number = 10;

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    init() {
        // シーン初期化
    }

    create() {
        // マップの生成
        this.mapGenerator = new MapGenerator(this.maxLevel);
        this.map = this.mapGenerator.generateMap();
        
        // 開始ノードを設定
        this.currentNode = this.mapGenerator.getNode(0, 1)!; // Lane.Center = 1
        this.currentNode.visited = true;

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

        // カメラの初期位置を設定
        this.cameras.main.setScroll(0, this.mapRenderer.calculateCameraY(this.currentNode) - 300);

        // フェードイン開始
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // 初期描画
        this.mapRenderer.draw();
    }

    private handleNodeSelected(node: Node) {
        // ノードの状態を更新
        this.currentNode = node;
        node.visited = true;

        // コンポーネントの状態を更新
        this.mapRenderer.updateState(this.map, this.currentNode);
        this.inputHandler.updateState(this.currentNode);

        // マップを再描画
        this.mapRenderer.draw();
    }
}