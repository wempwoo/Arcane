using System.Collections.Generic;

namespace ArcaneBackend.Core.Entities
{
    public enum Lane
    {
        Left = 0,
        Center = 1,
        Right = 2
    }

    public enum NodeType
    {
        Basic,
        Battle,
        SafeHaven
    }

    public class ExplorationNode
    {
        public int Id { get; set; }
        public int Level { get; set; }
        public Lane Lane { get; set; }
        public NodeType Type { get; set; }
        public bool Visited { get; set; }
        public required string ExplorationMapId { get; set; } // マップの一意識別子
        public Guid PlayerId { get; set; } // マップを所有するプレイヤーのID
        
        // 接続情報
        public ICollection<ExplorationPathway> OutgoingPaths { get; set; } = new List<ExplorationPathway>();
        public ICollection<ExplorationPathway> IncomingPaths { get; set; } = new List<ExplorationPathway>();
    }

    public class ExplorationPathway
    {
        public int Id { get; set; }
        public int FromNodeId { get; set; }
        public required ExplorationNode FromNode { get; set; }
        public int ToNodeId { get; set; }
        public required ExplorationNode ToNode { get; set; }
    }
}