import Phaser from 'phaser';

interface Node {
    x: number;
    y: number;
    connections: number[];  // 接続されているノードのインデックス
    visited: boolean;
}

export class ExplorationScene extends Phaser.Scene {
    private nodes: Node[] = [];
    private currentNodeIndex: number = 0;
    private graphics!: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    create() {
        // グラフィックスオブジェクトを作成
        this.graphics = this.add.graphics();

        // 仮のノードマップを作成（後で外部データから読み込むように変更予定）
        this.createInitialMap();

        // シーン開始時にフェードイン
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // クリック/タップ判定を追加
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleNodeSelection(pointer.x, pointer.y);
        });

        // 最初のノードを訪問済みにする
        this.nodes[this.currentNodeIndex].visited = true;

        // マップを描画
        this.drawMap();
    }

    private createInitialMap() {
        // 仮の固定マップを作成
        this.nodes = [
            { x: 400, y: 500, connections: [1, 2], visited: false },    // 開始ノード（下部）
            { x: 300, y: 400, connections: [0, 3], visited: false },
            { x: 500, y: 400, connections: [0, 3], visited: false },
            { x: 400, y: 300, connections: [1, 2], visited: false }     // 終了ノード（上部）
        ];
    }

    private drawMap() {
        this.graphics.clear();

        // パスを描画
        this.graphics.lineStyle(2, 0x666666);
        this.nodes.forEach((node, index) => {
            node.connections.forEach(connectedIndex => {
                const connectedNode = this.nodes[connectedIndex];
                this.graphics.beginPath();
                this.graphics.moveTo(node.x, node.y);
                this.graphics.lineTo(connectedNode.x, connectedNode.y);
                this.graphics.strokePath();
            });
        });

        // ノードを描画
        this.nodes.forEach((node, index) => {
            // 選択可能なノードか判定（接続されていて、かつ上方向にあるノードのみ）
            const isSelectable = this.nodes[this.currentNodeIndex].connections.includes(index)
                && this.nodes[index].y < this.nodes[this.currentNodeIndex].y;
            // 描画色を決定
            let color = 0x333333;  // 未訪問
            if (node.visited) color = 0x00ff00;  // 訪問済み
            if (isSelectable) color = 0x00ffff;  // 選択可能
            if (index === this.currentNodeIndex) color = 0xff0000;  // 現在地

            this.graphics.fillStyle(color);
            this.graphics.fillCircle(node.x, node.y, 20);
        });
    }

    private handleNodeSelection(x: number, y: number) {
        // クリック位置に最も近いノードを探す
        const clickedNodeIndex = this.findClosestNode(x, y);
        
        if (clickedNodeIndex !== -1) {
            const clickedNode = this.nodes[clickedNodeIndex];
            const currentNode = this.nodes[this.currentNodeIndex];

            // クリックされたノードが現在のノードから接続されており、かつ上方向への移動であることを確認
            if (currentNode.connections.includes(clickedNodeIndex) && clickedNode.y < currentNode.y) {
                // ノードへの移動をアニメーション
                const duration = 500;  // 500ms
                const moveMarker = this.add.circle(currentNode.x, currentNode.y, 10, 0xff0000);
                
                this.tweens.add({
                    targets: moveMarker,
                    x: clickedNode.x,
                    y: clickedNode.y,
                    duration: duration,
                    ease: 'Power2',
                    onComplete: () => {
                        moveMarker.destroy();
                        // 移動完了後に状態を更新
                        this.currentNodeIndex = clickedNodeIndex;
                        this.nodes[clickedNodeIndex].visited = true;
                        this.drawMap();
                    }
                });
            }
        }
    }

    private findClosestNode(x: number, y: number): number {
        const maxDistance = 30;  // クリック判定の最大距離
        let closestNode = -1;
        let closestDistance = maxDistance;

        this.nodes.forEach((node, index) => {
            const distance = Phaser.Math.Distance.Between(x, y, node.x, node.y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = index;
            }
        });

        return closestNode;
    }
}