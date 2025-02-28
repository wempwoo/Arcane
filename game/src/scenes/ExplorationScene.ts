import Phaser from 'phaser';

// レーンの定義
const enum Lane {
    Left = 0,
    Center = 1,
    Right = 2
}

// パスの方向を表現
const enum PathDirection {
    Straight,
    ToLeft,
    ToRight
}

// 各レーンで可能なパスの方向を定義
type PossiblePaths<L extends Lane> =
    L extends Lane.Left ? Extract<PathDirection, PathDirection.Straight | PathDirection.ToRight> :
    L extends Lane.Right ? Extract<PathDirection, PathDirection.Straight | PathDirection.ToLeft> :
    PathDirection;

// パス情報
interface Path<L extends Lane = Lane> {
    fromLevel: number;
    fromLane: L;
    direction: PossiblePaths<L>;
}

// ノードの定義
interface Node {
    level: number;
    lane: Lane;
    connections: NodeConnection[];
    visited: boolean;
}

// ノード接続情報
interface NodeConnection {
    targetLevel: number;
    targetLane: Lane;
}

export class ExplorationScene extends Phaser.Scene {
    private map!: Map<string, Node>;  // キーは "level,lane"
    private currentNode!: Node;
    private graphics!: Phaser.GameObjects.Graphics;
    private maxLevel: number = 10;

    // レイアウト設定
    private readonly LEVEL_HEIGHT = 100;
    private readonly LANE_WIDTH = 200;
    private readonly BASE_X = 400;
    private readonly WORLD_WIDTH = 800;
    private readonly WORLD_MARGIN = 100;

    constructor() {
        super({ key: 'ExplorationScene' });
    }

    create() {
        this.graphics = this.add.graphics();
        this.createInitialMap();

        // 開始ノードを現在のノードとして設定
        this.currentNode = this.getNode(0, Lane.Center)!;
        this.currentNode.visited = true;

        // カメラの初期設定
        const worldHeight = (this.maxLevel + 1) * this.LEVEL_HEIGHT;
        this.cameras.main.setBounds(0, -worldHeight * 2, this.WORLD_WIDTH, worldHeight * 3); // 十分な上下のスペースを確保
        this.cameras.main.setScroll(0, this.calculateCameraY(this.currentNode) - 300); // なぜか300ずらすとちょうどいい
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handleNodeSelection(pointer.x + this.cameras.main.scrollX, pointer.y + this.cameras.main.scrollY);
        });

        this.drawMap();
        this.drawMap();
    }

    private getTargetLane(fromLane: Lane, direction: PathDirection): Lane {
        switch (direction) {
            case PathDirection.Straight:
                return fromLane;
            case PathDirection.ToLeft:
                return fromLane - 1 as Lane;
            case PathDirection.ToRight:
                return fromLane + 1 as Lane;
        }
    }

    private getPossibleDirections<L extends Lane>(lane: L): PossiblePaths<L>[] {
        switch (lane) {
            case Lane.Left:
                return [PathDirection.Straight, PathDirection.ToRight] as PossiblePaths<L>[];
            case Lane.Center:
                return [PathDirection.Straight, PathDirection.ToLeft, PathDirection.ToRight] as PossiblePaths<L>[];
            case Lane.Right:
                return [PathDirection.Straight, PathDirection.ToLeft] as PossiblePaths<L>[];
            default:
                // この行は実行されないはずだが、型チェックのために必要
                return [] as PossiblePaths<L>[];
        }
    }

    private createInitialMap() {
        this.map = new Map();

        // 開始ノードを生成（中央レーン）
        this.createNode(0, Lane.Center);

        // レベル1からMAX_LEVEL-1まで生成
        for (let level = 0; level < this.maxLevel; level++) {
            if (level === this.maxLevel - 1) {
                // 最後のレベルは終了ノード（中央レーン）への接続のみ
                const nodes = this.getNodesAtLevel(level);
                nodes.forEach(node => {
                    if (Math.abs(node.lane - Lane.Center) <= 1) {
                        node.connections = [{ targetLevel: level + 1, targetLane: Lane.Center }];
                    }
                });
                // 終了ノードを生成
                this.createNode(level + 1, Lane.Center);
                continue;
            }

            // 現在のレベルの各ノードから次のレベルへのパスを生成
            const currentNodes = this.getNodesAtLevel(level);
            currentNodes.forEach(node => {
                // パスの生成
                const paths = this.generatePaths(level, node.lane);
                
                // パスに基づいてノードを生成し接続
                node.connections = paths.map(path => ({
                    targetLevel: level + 1,
                    targetLane: this.getTargetLane(path.fromLane, path.direction)
                }));

                // 接続先のノードを生成（存在しない場合のみ）
                paths.forEach(path => {
                    const targetLane = this.getTargetLane(path.fromLane, path.direction);
                    if (!this.getNode(level + 1, targetLane)) {
                        this.createNode(level + 1, targetLane);
                    }
                });
            });

            // 中央レーンのノードが存在しない場合は生成
            if (!this.getNode(level + 1, Lane.Center)) {
                this.createNode(level + 1, Lane.Center);
                // 前のレベルの最も近いノードから接続
                const prevNodes = this.getNodesAtLevel(level);
                if (prevNodes.length > 0) {
                    const closestNode = prevNodes.reduce((a, b) =>
                        Math.abs(a.lane - Lane.Center) <= Math.abs(b.lane - Lane.Center) ? a : b
                    );
                    closestNode.connections.push({
                        targetLevel: level + 1,
                        targetLane: Lane.Center
                    });
                }
            }
        }
    }

    private generatePaths<L extends Lane>(fromLevel: number, fromLane: L): Path<L>[] {
        const paths: Path<L>[] = [];
        const possibleDirections = this.getPossibleDirections(fromLane);
        
        // 必ず1つはパスを生成（ランダムに選択）
        const mainDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        paths.push({ fromLevel, fromLane, direction: mainDirection });

        // 50%の確率で追加のパスを生成
        if (Math.random() < 0.5) {
            const remainingDirections = possibleDirections.filter(d => d !== mainDirection);
            if (remainingDirections.length > 0) {
                const additionalDirection = remainingDirections[Math.floor(Math.random() * remainingDirections.length)];
                // 交差チェック
                const targetLane = this.getTargetLane(fromLane, additionalDirection);
                if (!this.wouldCauseCrossing(fromLevel, fromLane, targetLane)) {
                    paths.push({ fromLevel, fromLane, direction: additionalDirection });
                }
            }
        }

        return paths;
    }

    private wouldCauseCrossing(level: number, fromLane: Lane, toLane: Lane): boolean {
        const nodesAtLevel = this.getNodesAtLevel(level);
        return nodesAtLevel.some(node => {
            if (node.lane === fromLane) return false;
            
            return node.connections.some(conn => {
                const crossesPath = (
                    (node.lane < fromLane && conn.targetLane > toLane) ||
                    (node.lane > fromLane && conn.targetLane < toLane)
                );
                return crossesPath;
            });
        });
    }

    private createNode(level: number, lane: Lane): Node {
        const node: Node = {
            level,
            lane,
            connections: [],
            visited: false
        };
        this.map.set(`${level},${lane}`, node);
        return node;
    }

    private getNode(level: number, lane: Lane): Node | undefined {
        return this.map.get(`${level},${lane}`);
    }

    private getNodesAtLevel(level: number): Node[] {
        return Array.from(this.map.values()).filter(node => node.level === level);
    }

    private getNodeScreenPosition(node: Node): { x: number; y: number } {
        return {
            x: this.BASE_X + (node.lane - Lane.Center) * this.LANE_WIDTH,
            y: -node.level * this.LEVEL_HEIGHT - this.WORLD_MARGIN // 下から上に向かって減少
        };
    }

    private drawMap() {
        this.graphics.clear();

        // パスを描画
        this.graphics.lineStyle(2, 0x666666);
        Array.from(this.map.values()).forEach(node => {
            const startPos = this.getNodeScreenPosition(node);
            node.connections.forEach(conn => {
                const targetNode = this.getNode(conn.targetLevel, conn.targetLane);
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
                        // ノードの状態を更新
                        this.currentNode = clickedNode;
                        clickedNode.visited = true;
                        this.drawMap();

                        // カメラを移動（共通ロジックを使用）
                        const targetY = this.calculateCameraY(clickedNode);
                        this.cameras.main.pan(
                            0, // X座標は常に0
                            targetY,
                            500, // 0.5秒でスクロール
                            'Power2'
                        );

                        this.drawMap();
                    }
                });
            }
        }
    }

    private calculateCameraY(node: Node): number {
        const levelOffset = node.level * this.LEVEL_HEIGHT;
        const screenOffset = this.cameras.main.height / 3; // 画面の1/3の位置に表示
        return -levelOffset - screenOffset;
    }

    private findClosestNode(x: number, y: number): Node | null {
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
}