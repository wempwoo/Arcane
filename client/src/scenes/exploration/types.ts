// バックエンドとの連携用の型定義
export interface ExplorationMapData {
    mapId: string;
    nodes: ExplorationNodeData[];
}

export interface ExplorationNodeData {
    id: number;
    level: number;
    lane: string;
    type: string;
    visited: boolean;
    outgoingPaths: ExplorationPathData[];
}

export interface ExplorationPathData {
    toNodeId: number;
}

// レーンの定義
export const enum Lane {
    Left = 0,
    Center = 1,
    Right = 2
}

// パスの方向を表現
export const enum PathDirection {
    Straight,
    ToLeft,
    ToRight
}

// 各レーンで可能なパスの方向を定義
export type PossiblePaths<L extends Lane> =
    L extends Lane.Left ? Extract<PathDirection, PathDirection.Straight | PathDirection.ToRight> :
    L extends Lane.Right ? Extract<PathDirection, PathDirection.Straight | PathDirection.ToLeft> :
    PathDirection;

// パス情報
export interface Path<L extends Lane = Lane> {
    fromLevel: number;
    fromLane: L;
    direction: PossiblePaths<L>;
}

// ノードタイプの定義
export const enum NodeType {
    Basic = 'basic',
    Battle = 'battle',
    SafeHaven = 'safe_haven'
}

// ノードの定義
export interface Node {
    id: number;           // バックエンドのIDを追加
    level: number;
    lane: Lane;
    connections: NodeConnection[];
    visited: boolean;
    type: NodeType;
}

// ノード接続情報
export interface NodeConnection {
    targetLevel: number;
    targetLane: Lane;
    targetId: number;     // バックエンドのIDを追加
}

// バックエンドのデータを内部形式に変換するユーティリティ関数
export function convertBackendNode(data: ExplorationNodeData, nodeMap: Map<number, ExplorationNodeData>): Node {
    return {
        id: data.id,
        level: data.level,
        lane: {
            'Left': Lane.Left,
            'Center': Lane.Center,
            'Right': Lane.Right
        }[data.lane] ?? Lane.Center,
        type: data.type.toLowerCase() as NodeType,
        visited: data.visited,
        connections: data.outgoingPaths.map(path => {
            const targetNode = nodeMap.get(path.toNodeId);
            if (!targetNode) throw new Error(`Invalid path: target node ${path.toNodeId} not found`);
            return {
                targetId: path.toNodeId,
                targetLevel: targetNode.level,
                targetLane: targetNode.lane === 'Left' ? Lane.Left :
                          targetNode.lane === 'Right' ? Lane.Right : Lane.Center
            };
        })
    };
}

// ノードの画面上の位置
export interface NodePosition {
    x: number;
    y: number;
}

// 行動の定義
export interface Action {
    id: string;
    name: string;
    description: string;
    icon?: string; // 将来的にアイコンを追加する際に使用
}

// ノードタイプごとの利用可能な行動
export const NODE_ACTIONS: Record<NodeType, Action[]> = {
    [NodeType.Basic]: [],
    [NodeType.Battle]: [
        {
            id: 'fight',
            name: '戦う',
            description: '敵と戦闘を開始します'
        },
        {
            id: 'sneak',
            name: 'すり抜ける',
            description: '敵に気づかれないように通り抜けます'
        }
    ],
    [NodeType.SafeHaven]: [
        {
            id: 'build',
            name: 'ビルド',
            description: '魔導機のビルドを行います'
        },
        {
            id: 'do_nothing',
            name: '何もしない',
            description: '何もしません'
        }
    ]
};