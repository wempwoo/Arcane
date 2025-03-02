import { Lane, PathDirection, Node, Path, PossiblePaths, NodeType } from './types';

export class MapGenerator {
    private map: Map<string, Node>;
    private readonly maxLevel: number;

    constructor(maxLevel: number) {
        this.map = new Map();
        this.maxLevel = maxLevel;
    }

    generateMap(): Map<string, Node> {
        this.map.clear();
        this.createInitialMap();
        return this.map;
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
                return [] as PossiblePaths<L>[];
        }
    }

    private createInitialMap() {
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

    private determineNodeType(level: number): NodeType {
        // 開始ノード（level 0）と終了ノード（maxLevel）は基本ノード
        if (level === 0 || level === this.maxLevel) {
            return NodeType.Basic;
        }

        // その他のノードはランダムで決定
        const random = Math.random();
        if (random < 0.3) {
            return NodeType.Battle;    // 30%の確率で戦闘ノード
        } else if (random < 0.4) {
            return NodeType.SafeHaven; // 10%の確率で安全地帯
        } else {
            return NodeType.Basic;     // 60%の確率で基本ノード
        }
    }

    private createNode(level: number, lane: Lane): Node {
        const node: Node = {
            level,
            lane,
            connections: [],
            visited: false,
            type: this.determineNodeType(level)
        };
        this.map.set(`${level},${lane}`, node);
        return node;
    }

    getNode(level: number, lane: Lane): Node | undefined {
        return this.map.get(`${level},${lane}`);
    }

    getNodesAtLevel(level: number): Node[] {
        return Array.from(this.map.values()).filter(node => node.level === level);
    }
}