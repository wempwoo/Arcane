using System;
using System.Collections.Generic;
using System.Linq;
using ArcaneBackend.Core.Models;

namespace ArcaneBackend.Core.Services
{
    public class ExplorationMapGenerator
    {
        private readonly Random _random;

        public ExplorationMapGenerator(int? seed = null)
        {
            _random = seed.HasValue ? new Random(seed.Value) : new Random();
        }

        public ExplorationMap Generate(int maxLevel)
        {
            var map = new ExplorationMap(Guid.NewGuid().ToString());

            // 開始ノードを生成（中央レーン）
            var startNode = CreateNode(0, Lane.Center);
            map.AddNode(startNode);

            // レベル1からmaxLevel-1まで生成
            for (int level = 0; level < maxLevel; level++)
            {
                if (level == maxLevel - 1)
                {
                    GenerateFinalLevel(map, level);
                    continue;
                }

                GenerateLevel(map, level);
            }

            return map;
        }

        private void GenerateFinalLevel(ExplorationMap map, int currentLevel)
        {
            // 最後のレベルは終了ノード（中央レーン）への接続のみ
            var endNode = CreateNode(currentLevel + 1, Lane.Center);
            map.AddNode(endNode);

            var currentNodes = map.GetNodesAtLevel(currentLevel);
            foreach (var node in currentNodes)
            {
                if (Math.Abs((int)node.Lane - (int)Lane.Center) <= 1)
                {
                    CreatePath(node, endNode);
                }
            }
        }

        private void GenerateLevel(ExplorationMap map, int currentLevel)
        {
            // 現在のレベルの各ノードから次のレベルへのパスを生成
            var currentNodes = map.GetNodesAtLevel(currentLevel);
            foreach (var node in currentNodes)
            {
                var paths = GeneratePaths(node.Lane);
                foreach (var (fromLane, direction) in paths)
                {
                    var targetLane = GetTargetLane(fromLane, direction);
                    var targetNode = map.GetNode(currentLevel + 1, targetLane);

                    if (targetNode == null)
                    {
                        targetNode = CreateNode(currentLevel + 1, targetLane);
                        map.AddNode(targetNode);
                    }

                    CreatePath(node, targetNode);
                }
            }

            // 中央レーンのノードが存在しない場合は生成
            var centerNode = map.GetNode(currentLevel + 1, Lane.Center);
            if (centerNode == null)
            {
                centerNode = CreateNode(currentLevel + 1, Lane.Center);
                map.AddNode(centerNode);

                // 前のレベルの最も近いノードから接続
                var prevNodes = map.GetNodesAtLevel(currentLevel);
                if (prevNodes.Any())
                {
                    var closestNode = prevNodes
                        .OrderBy(n => Math.Abs((int)n.Lane - (int)Lane.Center))
                        .First();
                    CreatePath(closestNode, centerNode);
                }
            }
        }

        private MapNode CreateNode(int level, Lane lane)
        {
            return new MapNode
            {
                Level = level,
                Lane = lane,
                Type = DetermineNodeType(level),
                OutgoingPaths = new List<MapPath>(),
                IncomingPaths = new List<MapPath>()
            };
        }

        private void CreatePath(MapNode fromNode, MapNode toNode)
        {
            var path = new MapPath
            {
                FromNode = fromNode,
                ToNode = toNode
            };

            fromNode.OutgoingPaths.Add(path);
            toNode.IncomingPaths.Add(path);
        }

        private NodeType DetermineNodeType(int level)
        {
            if (level == 0) return NodeType.Basic;

            var random = _random.NextDouble();
            if (random < 0.3)
                return NodeType.Battle;
            else if (random < 0.4)
                return NodeType.SafeHaven;
            else
                return NodeType.Basic;
        }

        private Lane GetTargetLane(Lane fromLane, PathDirection direction)
        {
            return direction switch
            {
                PathDirection.Straight => fromLane,
                PathDirection.ToLeft => (Lane)((int)fromLane - 1),
                PathDirection.ToRight => (Lane)((int)fromLane + 1),
                _ => throw new ArgumentException("Invalid direction", nameof(direction))
            };
        }

        private List<(Lane FromLane, PathDirection Direction)> GeneratePaths(Lane fromLane)
        {
            var paths = new List<(Lane, PathDirection)>();
            var possibleDirections = GetPossibleDirections(fromLane);

            // 必ず1つはパスを生成（ランダムに選択）
            var mainDirection = possibleDirections[_random.Next(possibleDirections.Count)];
            paths.Add((fromLane, mainDirection));

            // 50%の確率で追加のパスを生成
            if (_random.NextDouble() < 0.5)
            {
                var remainingDirections = possibleDirections.Where(d => d != mainDirection).ToList();
                if (remainingDirections.Any())
                {
                    var additionalDirection = remainingDirections[_random.Next(remainingDirections.Count)];
                    paths.Add((fromLane, additionalDirection));
                }
            }

            return paths;
        }

        private List<PathDirection> GetPossibleDirections(Lane lane)
        {
            return lane switch
            {
                Lane.Left => new List<PathDirection> { PathDirection.Straight, PathDirection.ToRight },
                Lane.Center => new List<PathDirection> { PathDirection.Straight, PathDirection.ToLeft, PathDirection.ToRight },
                Lane.Right => new List<PathDirection> { PathDirection.Straight, PathDirection.ToLeft },
                _ => new List<PathDirection>()
            };
        }
    }

    public enum PathDirection
    {
        Straight,
        ToLeft,
        ToRight
    }
}