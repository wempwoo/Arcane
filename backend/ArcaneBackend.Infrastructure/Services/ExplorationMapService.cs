using System.Threading.Tasks;
using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Interfaces;
using ArcaneBackend.Core.Models;
using ArcaneBackend.Core.Services;
using ArcaneBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace ArcaneBackend.Infrastructure.Services
{
    public class ExplorationMapService : IExplorationMapService
    {
        private readonly ArcaneDbContext _context;
        private readonly ExplorationMapGenerator _generator;

        public ExplorationMapService(ArcaneDbContext context)
        {
            _context = context;
            _generator = new ExplorationMapGenerator();
        }

        public async Task<string> GenerateMapAsync(int maxLevel)
        {
            // マップを生成
            var map = _generator.Generate(maxLevel);

            // 生成されたマップをエンティティに変換
            var (nodes, pathways) = ConvertToEntities(map);

            // データベースに保存
            await _context.ExplorationNodes.AddRangeAsync(nodes);
            await _context.ExplorationPathways.AddRangeAsync(pathways);
            await _context.SaveChangesAsync();

            return map.Id;
        }

        public async Task<ExplorationNode[]> GetMapNodesAsync(string explorationMapId)
        {
            return await _context.ExplorationNodes
                .Include(n => n.OutgoingPaths)
                .ThenInclude(p => p.ToNode)
                .Include(n => n.IncomingPaths)
                .ThenInclude(p => p.FromNode)
                .Where(n => n.ExplorationMapId == explorationMapId)
                .ToArrayAsync();
        }

        public async Task MarkNodeAsVisitedAsync(int nodeId)
        {
            var node = await _context.ExplorationNodes.FindAsync(nodeId);
            if (node != null)
            {
                node.Visited = true;
                await _context.SaveChangesAsync();
            }
        }

        private (List<ExplorationNode> Nodes, List<ExplorationPathway> Pathways) ConvertToEntities(ExplorationMap map)
        {
            var nodes = new List<ExplorationNode>();
            var pathways = new List<ExplorationPathway>();
            var nodeMap = new Dictionary<MapNode, ExplorationNode>();

            // ノードの変換
            foreach (var modelNode in map.GetAllNodes())
            {
                var entityNode = new ExplorationNode
                {
                    Level = modelNode.Level,
                    Lane = (Core.Entities.Lane)modelNode.Lane,
                    Type = (Core.Entities.NodeType)modelNode.Type,
                    Visited = modelNode.Visited,
                    ExplorationMapId = map.Id,
                    OutgoingPaths = new List<ExplorationPathway>(),
                    IncomingPaths = new List<ExplorationPathway>()
                };
                nodes.Add(entityNode);
                nodeMap[modelNode] = entityNode;
            }

            // パスの変換
            foreach (var modelNode in map.GetAllNodes())
            {
                var fromNode = nodeMap[modelNode];
                foreach (var modelPath in modelNode.OutgoingPaths)
                {
                    var toNode = nodeMap[modelPath.ToNode];
                    var entityPath = new ExplorationPathway
                    {
                        FromNode = fromNode,
                        ToNode = toNode
                    };
                    pathways.Add(entityPath);
                    fromNode.OutgoingPaths.Add(entityPath);
                    toNode.IncomingPaths.Add(entityPath);
                }
            }

            return (nodes, pathways);
        }
    }
}