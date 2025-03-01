import Phaser from 'phaser';
import { Lane, Node, NodePosition, NodeType } from './types';

export class MapRenderer {
    private graphics: Phaser.GameObjects.Graphics;
    private currentNode: Node;
    private map: Map<string, Node>;

    // レイアウト設定
    private readonly LEVEL_HEIGHT = 100;
    private readonly LANE_WIDTH = 100; // スマートフォン画面に合わせて調整
    private readonly BASE_X = 195; // WORLD_WIDTHの半分
    private readonly WORLD_WIDTH = 390; // 一般的なスマートフォンの画面幅
    private readonly WORLD_MARGIN = 100;

    constructor(
        scene: Phaser.Scene,
        map: Map<string, Node>,
        currentNode: Node
    ) {
        this.graphics = scene.add.graphics();
        this.map = map;
        this.currentNode = currentNode;
    }

    updateState(map: Map<string, Node>, currentNode: Node) {
        this.map = map;
        this.currentNode = currentNode;
    }

    draw() {
        this.graphics.clear();
        this.drawPaths();
        this.drawNodes();
    }

    getNodeScreenPosition(node: Node): NodePosition {
        return {
            x: this.BASE_X + (node.lane - Lane.Center) * this.LANE_WIDTH,
            y: -node.level * this.LEVEL_HEIGHT - this.WORLD_MARGIN
        };
    }

    calculateInitialCameraY(node: Node): number {
        return this.calculateCameraY(node) - 420;
    }

    calculateCameraY(node: Node): number {
        const levelOffset = node.level * this.LEVEL_HEIGHT;
        const screenOffset = 100; // HUDを考慮したカメラの位置調整
        return -levelOffset - screenOffset;
    }

    findClosestNode(x: number, y: number): Node | null {
        const maxDistance = 30;
        let closestNode: Node | null = null;
        let closestDistance = maxDistance;

        Array.from(this.map.values()).forEach(node => {
            const pos = this.getNodeScreenPosition(node);
            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = node;
            }
        });

        return closestNode;
    }

    private drawPaths() {
        this.graphics.lineStyle(2, 0x666666);
        Array.from(this.map.values()).forEach(node => {
            const startPos = this.getNodeScreenPosition(node);
            node.connections.forEach(conn => {
                const targetNode = this.map.get(`${conn.targetLevel},${conn.targetLane}`);
                if (targetNode) {
                    const endPos = this.getNodeScreenPosition(targetNode);
                    this.graphics.beginPath();
                    this.graphics.moveTo(startPos.x, startPos.y);
                    this.graphics.lineTo(endPos.x, endPos.y);
                    this.graphics.strokePath();
                }
            });
        });
    }

    private drawNodes() {
        Array.from(this.map.values()).forEach(node => {
            const pos = this.getNodeScreenPosition(node);
            
            // 選択可能なノードか判定
            const isSelectable = this.currentNode.connections.some(conn =>
                conn.targetLevel === node.level && conn.targetLane === node.lane
            );

            // 選択可能なノードの輝きエフェクト
            if (isSelectable) {
                // 外側の輝き（半透明の大きな円）
                this.graphics.fillStyle(0x00ffff, 0.3);
                this.graphics.fillCircle(pos.x, pos.y, 30);
                
                // 内側の輝き（より濃い色の中間サイズの円）
                this.graphics.fillStyle(0x00ffff, 0.5);
                this.graphics.fillCircle(pos.x, pos.y, 25);
            }

            // 基本色を決定（ノードタイプに基づく）
            let baseColor = node.type === NodeType.Battle ? 0xff0000 : 0x333333;

            // 状態による色の上書き
            if (node.visited) baseColor = 0x00ff00;  // 訪問済み
            if (node === this.currentNode) baseColor = 0xffff00;  // 現在地は黄色

            // メインのノードを描画
            this.graphics.fillStyle(baseColor);
            this.graphics.fillCircle(pos.x, pos.y, 20);

            // 戦闘ノードの場合、剣マークを描画（十字線で表現）
            if (node.type === NodeType.Battle && !node.visited) {
                this.graphics.lineStyle(2, 0xffffff);
                // 縦線
                this.graphics.beginPath();
                this.graphics.moveTo(pos.x, pos.y - 10);
                this.graphics.lineTo(pos.x, pos.y + 10);
                this.graphics.strokePath();
                // 横線
                this.graphics.beginPath();
                this.graphics.moveTo(pos.x - 10, pos.y);
                this.graphics.lineTo(pos.x + 10, pos.y);
                this.graphics.strokePath();
            }

            // 訪問済みノードのチェックマーク
            if (node.visited) {
                this.graphics.lineStyle(2, 0xffffff);
                this.graphics.beginPath();
                // チェックマークの描画（√形）
                this.graphics.moveTo(pos.x - 8, pos.y);
                this.graphics.lineTo(pos.x - 3, pos.y + 5);
                this.graphics.lineTo(pos.x + 8, pos.y - 6);
                this.graphics.strokePath();
            }
        });
    }

    // カメラ設定のヘルパーメソッド
    setupCamera(scene: Phaser.Scene, maxLevel: number) {
        const worldHeight = (maxLevel + 1) * this.LEVEL_HEIGHT;
        scene.cameras.main.setBounds(
            0,
            -worldHeight * 2,
            this.WORLD_WIDTH,
            worldHeight * 3
        );
    }

    get worldWidth() {
        return this.WORLD_WIDTH;
    }

    get levelHeight() {
        return this.LEVEL_HEIGHT;
    }
}