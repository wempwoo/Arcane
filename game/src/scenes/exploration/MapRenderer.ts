import Phaser from 'phaser';
import { Lane, Node, NodePosition } from './types';

export class MapRenderer {
    private graphics: Phaser.GameObjects.Graphics;
    private currentNode: Node;
    private map: Map<string, Node>;

    // レイアウト設定
    private readonly LEVEL_HEIGHT = 100;
    private readonly LANE_WIDTH = 200;
    private readonly BASE_X = 400;
    private readonly WORLD_WIDTH = 800;
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

    calculateCameraY(node: Node): number {
        const levelOffset = node.level * this.LEVEL_HEIGHT;
        const screenOffset = 300; // カメラの位置調整
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

            // 描画色を決定
            let color = 0x333333;  // 未訪問
            if (node.visited) color = 0x00ff00;  // 訪問済み
            if (isSelectable) color = 0x00ffff;  // 選択可能
            if (node === this.currentNode) color = 0xff0000;  // 現在地

            this.graphics.fillStyle(color);
            this.graphics.fillCircle(pos.x, pos.y, 20);
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