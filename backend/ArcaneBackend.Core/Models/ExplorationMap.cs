using System.Collections.Generic;

namespace ArcaneBackend.Core.Models
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

    public class MapNode
    {
        public int Level { get; set; }
        public Lane Lane { get; set; }
        public NodeType Type { get; set; }
        public bool Visited { get; set; }
        public List<MapPath> OutgoingPaths { get; set; } = new();
        public List<MapPath> IncomingPaths { get; set; } = new();
    }

    public class MapPath
    {
        public required MapNode FromNode { get; set; }
        public required MapNode ToNode { get; set; }
    }

    public class ExplorationMap
    {
        public string Id { get; }
        private readonly Dictionary<string, MapNode> _nodes;

        public ExplorationMap(string id)
        {
            Id = id;
            _nodes = new Dictionary<string, MapNode>();
        }

        public void AddNode(MapNode node)
        {
            _nodes.Add(GetNodeKey(node.Level, node.Lane), node);
        }

        public MapNode? GetNode(int level, Lane lane)
        {
            return _nodes.TryGetValue(GetNodeKey(level, lane), out var node) ? node : null;
        }

        public IEnumerable<MapNode> GetNodesAtLevel(int level)
        {
            return _nodes.Values.Where(n => n.Level == level);
        }

        public IEnumerable<MapNode> GetAllNodes() => _nodes.Values;

        private static string GetNodeKey(int level, Lane lane) => $"{level},{lane}";
    }
}