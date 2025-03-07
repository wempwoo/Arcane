using System.Collections.Generic;

namespace ArcaneBackend.API.Models
{
    /// <summary>
    /// マップ生成リクエスト
    /// </summary>
    /// <remarks>
    /// 現在は簡易的なパラメータのみを受け付けていますが、
    /// 将来的には以下のような拡張を予定しています：
    /// - マップの種類（通常/イベント/ボス等）
    /// - 難易度設定
    /// - 特殊条件（特定のノードタイプの出現確率変更等）
    /// </remarks>
    public class GenerateMapRequest
    {
        /// <summary>
        /// マップの最大レベル（深さ）
        /// </summary>
        /// <remarks>
        /// 注: このパラメータは参考実装用です。
        /// 将来的には、マップの種類や難易度に基づいて自動的に決定される予定です。
        /// </remarks>
        public int MaxLevel { get; set; }

        // 将来的な拡張用パラメータ
        // public string MapType { get; set; }          // マップの種類（通常/イベント/ボス等）
        // public string Difficulty { get; set; }       // 難易度（Easy/Normal/Hard等）
        // public Dictionary<string, object> Parameters { get; set; }  // 追加パラメータ
    }

    /// <summary>
    /// マップ生成/取得レスポンス
    /// </summary>
    public class ExplorationMapResponse
    {
        /// <summary>
        /// マップの一意識別子
        /// </summary>
        public string MapId { get; set; }

        /// <summary>
        /// マップを構成するノード群
        /// </summary>
        public List<ExplorationNodeResponse> Nodes { get; set; }
    }

    /// <summary>
    /// 探索マップのノード情報
    /// </summary>
    public class ExplorationNodeResponse
    {
        /// <summary>
        /// ノードの一意識別子
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// ノードのレベル（深さ）
        /// </summary>
        public int Level { get; set; }

        /// <summary>
        /// ノードのレーン位置
        /// </summary>
        public string Lane { get; set; }

        /// <summary>
        /// ノードの種類
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// 訪問済みかどうか
        /// </summary>
        public bool Visited { get; set; }

        /// <summary>
        /// このノードから出ていくパス情報
        /// </summary>
        public List<ExplorationPathResponse> OutgoingPaths { get; set; }
    }

    /// <summary>
    /// ノード間のパス情報
    /// </summary>
    public class ExplorationPathResponse
    {
        /// <summary>
        /// 接続先のノードID
        /// </summary>
        public int ToNodeId { get; set; }
    }
}