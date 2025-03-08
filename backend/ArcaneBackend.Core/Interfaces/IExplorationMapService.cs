using ArcaneBackend.Core.Entities;
using System.Threading.Tasks;

namespace ArcaneBackend.Core.Interfaces
{
    public interface IExplorationMapService
    {
        /// <summary>
        /// 新しい探索マップを生成します
        /// </summary>
        /// <param name="maxLevel">マップの最大レベル（深さ）</param>
        /// <param name="playerId">マップを生成するプレイヤーのID</param>
        /// <returns>生成されたマップのID</returns>
        Task<string> GenerateMapAsync(int maxLevel, Guid playerId);

        /// <summary>
        /// 指定されたマップIDの探索マップのノードを取得します
        /// </summary>
        /// <param name="explorationMapId">探索マップID</param>
        /// <param name="playerId">ノードを取得するプレイヤーのID</param>
        /// <returns>マップを構成するノードの配列</returns>
        Task<ExplorationNode[]> GetMapNodesAsync(string explorationMapId, Guid playerId);

        /// <summary>
        /// 指定されたノードを訪問済みとしてマークします
        /// </summary>
        /// <param name="nodeId">ノードID</param>
        /// <param name="playerId">ノードを訪問するプレイヤーのID</param>
        Task MarkNodeAsVisitedAsync(int nodeId, Guid playerId);
    }
}