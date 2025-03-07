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
        /// <returns>生成されたマップのID</returns>
        Task<string> GenerateMapAsync(int maxLevel);

        /// <summary>
        /// 指定されたマップIDの探索マップのノードを取得します
        /// </summary>
        /// <param name="explorationMapId">探索マップID</param>
        /// <returns>マップを構成するノードの配列</returns>
        Task<ExplorationNode[]> GetMapNodesAsync(string explorationMapId);

        /// <summary>
        /// 指定されたノードを訪問済みとしてマークします
        /// </summary>
        /// <param name="nodeId">ノードID</param>
        Task MarkNodeAsVisitedAsync(int nodeId);
    }
}