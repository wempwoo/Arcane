import Phaser from 'phaser';

// レーンの定義（0: 左, 1: 中央, 2: 右）
type Lane = 0 | 1 | 2;

// ノードの定義
interface Node {
    level: number;    // 縦方向の位置（0から開始）
    lane: Lane;       // 横方向の位置
    connections: NodeConnection[];  // 次のレベルへの接続情報
    visited: boolean;
}

// ノード接続情報
interface NodeConnection {
    targetLevel: number;  // 接続先のレベル（必ず現在のlevel + 1）
    targetLane: Lane;    // 接続先のレーン
}

// マップ全体の定義
interface Map {
    nodes: Node[];       // マップ上の全ノード
    maxLevel: number;    // 最大レベル（終了ノードのレベル）
}

export class ExplorationScene extends Phaser.Scene {
    private map!: Map;
    private currentNode!: Node;
    private graphics!: Phaser.GameObjects.Graphics;

    // レイアウト設定
    private readonly LEVEL_HEIGHT = 100;  // レベル間の縦方向の距離
    private readonly LANE_WIDTH = 200;    // レーン間の横方向の距離
    private readonly BASE_Y = 500;        // 開始レベル（0）のY座標
    private readonly BASE_X = 400;        // 中央レーン（1）のX座標

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    create() {
        this.graphics = this.add.graphics();
        this.createInitialMap();
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleNodeSelection(pointer.x, pointer.y);
        });

        // 開始ノードを現在のノードとして設定
        this.currentNode = this.map.nodes.find(node => node.level === 0)!;
        this.currentNode.visited = true;

        this.drawMap();
    }

    private createInitialMap() {
        // 仮の固定マップを作成
        this.map = {
            maxLevel: 2,
            nodes: [
                // レベル0（開始レベル）
                {
                    level: 0,
                    lane: 1,  // 中央レーン
                    connections: [
                        { targetLevel: 1, targetLane: 0 },  // 左に分岐
                        { targetLevel: 1, targetLane: 2 }   // 右に分岐
                    ],
                    visited: false
                },
                // レベル1
                {
                    level: 1,
                    lane: 0,  // 左レーン
                    connections: [
                        { targetLevel: 2, targetLane: 1 }   // 中央に合流
                    ],
                    visited: false
                },
                {
                    level: 1,
                    lane: 2,  // 右レーン
                    connections: [
                        { targetLevel: 2, targetLane: 1 }   // 中央に合流
                    ],
                    visited: false
                },
                // レベル2（終了レベル）
                {
                    level: 2,
                    lane: 1,  // 中央レーン
                    connections: [],  // 終了ノードは接続なし
                    visited: false
                }
            ]
        };
    }

    private getNodeScreenPosition(node: Node): { x: number; y: number } {
        return {
            x: this.BASE_X + (node.lane - 1) * this.LANE_WIDTH,  // レーンに基づくX座標
            y: this.BASE_Y - node.level * this.LEVEL_HEIGHT      // レベルに基づくY座標
        };
    }

    private drawMap() {
        this.graphics.clear();

        // パスを描画
        this.graphics.lineStyle(2, 0x666666);
        this.map.nodes.forEach(node => {
            const startPos = this.getNodeScreenPosition(node);
            node.connections.forEach(conn => {
                const targetNode = this.map.nodes.find(n => 
                    n.level === conn.targetLevel && n.lane === conn.targetLane
                );
                if (targetNode) {
                    const endPos = this.getNodeScreenPosition(targetNode);
                    this.graphics.beginPath();
                    this.graphics.moveTo(startPos.x, startPos.y);
                    this.graphics.lineTo(endPos.x, endPos.y);
                    this.graphics.strokePath();
                }
            });
        });

        // ノードを描画
        this.map.nodes.forEach(node => {
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

    private handleNodeSelection(x: number, y: number) {
        const clickedNode = this.findClosestNode(x, y);
        
        if (clickedNode) {
            const isSelectable = this.currentNode.connections.some(conn =>
                conn.targetLevel === clickedNode.level && conn.targetLane === clickedNode.lane
            );

            if (isSelectable) {
                const startPos = this.getNodeScreenPosition(this.currentNode);
                const endPos = this.getNodeScreenPosition(clickedNode);
                
                // ノードへの移動をアニメーション
                const moveMarker = this.add.circle(startPos.x, startPos.y, 10, 0xff0000);
                
                this.tweens.add({
                    targets: moveMarker,
                    x: endPos.x,
                    y: endPos.y,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        moveMarker.destroy();
                        this.currentNode = clickedNode;
                        clickedNode.visited = true;
                        this.drawMap();
                    }
                });
            }
        }
    }

    private findClosestNode(x: number, y: number): Node | null {
        const maxDistance = 30;
        let closestNode: Node | null = null;
        let closestDistance = maxDistance;

        this.map.nodes.forEach(node => {
            const pos = this.getNodeScreenPosition(node);
            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = node;
            }
        });

        return closestNode;
    }
}