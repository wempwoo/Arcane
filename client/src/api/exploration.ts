import { authenticatedRequest } from './request';
import { ExplorationMapData } from '../scenes/exploration/types';

const BASE_URL = 'http://localhost:5170/api';

export const ExplorationAPI = {
  async generateMap(maxLevel: number): Promise<ExplorationMapData> {
    const response = await authenticatedRequest(
      `${BASE_URL}/exploration-maps`, 
      {
        method: 'POST',
        body: JSON.stringify({ maxLevel })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate map');
    }

    return response.json();
  },

  async getMap(mapId: string): Promise<ExplorationMapData> {
    const response = await authenticatedRequest(
      `${BASE_URL}/exploration-maps/${mapId}`
    );

    if (!response.ok) {
      throw new Error('Failed to get map');
    }

    return response.json();
  },

  async markNodeAsVisited(mapId: string, nodeId: number): Promise<void> {
    const response = await authenticatedRequest(
      `${BASE_URL}/exploration-maps/${mapId}/nodes/${nodeId}/visit`, 
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Failed to mark node as visited');
    }
  }
};