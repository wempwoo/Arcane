export interface GenerateMapRequest {
    maxLevel: number;
}

export interface ExplorationMapResponse {
    mapId: string;
    nodes: ExplorationNodeResponse[];
}

export interface ExplorationNodeResponse {
    id: number;
    level: number;
    lane: string;
    type: string;
    visited: boolean;
    outgoingPaths: ExplorationPathResponse[];
}

export interface ExplorationPathResponse {
    toNodeId: number;
}

export class ExplorationMapAPI {
    private static readonly BASE_URL = 'http://localhost:5170/api';

    static async generateMap(maxLevel: number): Promise<ExplorationMapResponse> {
        const response = await fetch(`${this.BASE_URL}/exploration-maps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ maxLevel })
        });

        if (!response.ok) {
            throw new Error('Failed to generate map');
        }

        return response.json();
    }

    static async getMap(mapId: string): Promise<ExplorationMapResponse> {
        const response = await fetch(`${this.BASE_URL}/exploration-maps/${mapId}`);

        if (!response.ok) {
            throw new Error('Failed to get map');
        }

        return response.json();
    }

    static async markNodeAsVisited(mapId: string, nodeId: number): Promise<void> {
        const response = await fetch(`${this.BASE_URL}/exploration-maps/${mapId}/nodes/${nodeId}/visit`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to mark node as visited');
        }
    }
}