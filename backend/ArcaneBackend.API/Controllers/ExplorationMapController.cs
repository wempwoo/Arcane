using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ArcaneBackend.API.Models;
using ArcaneBackend.API.Utils;
using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArcaneBackend.API.Controllers
{
    /// <summary>
    /// 探索マップ関連のAPI
    /// </summary>
    /// <remarks>
    /// 現在は基本的なマップ生成と取得機能のみを提供していますが、
    /// 将来的には以下のような機能の追加を予定しています：
    /// - マップの種類や難易度に基づく生成
    /// - プレイヤーの進行状況に応じた動的なマップ調整
    /// - マップ内の特殊イベントの管理
    /// </remarks>
    [Authorize]
    [ApiController]
    [Route("api/exploration-maps")]
    public class ExplorationMapController : ControllerBase
    {
        private readonly IExplorationMapService _mapService;

        public ExplorationMapController(IExplorationMapService mapService)
        {
            _mapService = mapService;
        }

        /// <summary>
        /// 新しい探索マップを生成します
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ExplorationMapResponse>> GenerateMap([FromBody] GenerateMapRequest request)
        {
            if (request.MaxLevel < 2 || request.MaxLevel > 10)
            {
                return BadRequest("マップのレベルは2から10の間で指定してください。");
            }

            var playerId = AuthUtils.GetCurrentPlayerId(User);
            var mapId = await _mapService.GenerateMapAsync(request.MaxLevel, playerId);
            var nodes = await _mapService.GetMapNodesAsync(mapId, playerId);

            return Ok(CreateMapResponse(mapId, nodes));
        }

        /// <summary>
        /// 指定されたマップの情報を取得します
        /// </summary>
        [HttpGet("{mapId}")]
        public async Task<ActionResult<ExplorationMapResponse>> GetMap(string mapId)
        {
            var playerId = AuthUtils.GetCurrentPlayerId(User);
            var nodes = await _mapService.GetMapNodesAsync(mapId, playerId);
            if (!nodes.Any())
            {
                return NotFound($"マップID '{mapId}' が見つかりません。");
            }

            return Ok(CreateMapResponse(mapId, nodes));
        }

        /// <summary>
        /// 指定されたノードを訪問済みとしてマークします
        /// </summary>
        [HttpPost("{mapId}/nodes/{nodeId}/visit")]
        public async Task<ActionResult> MarkNodeAsVisited(string mapId, int nodeId)
        {
            var playerId = AuthUtils.GetCurrentPlayerId(User);
            var nodes = await _mapService.GetMapNodesAsync(mapId, playerId);
            var node = nodes.FirstOrDefault(n => n.Id == nodeId);
            
            if (node == null)
            {
                return NotFound($"ノードID '{nodeId}' が見つかりません。");
            }

            if (node.ExplorationMapId != mapId)
            {
                return BadRequest("指定されたノードは、このマップに属していません。");
            }

            await _mapService.MarkNodeAsVisitedAsync(nodeId, playerId);
            return NoContent();
        }

        private static ExplorationMapResponse CreateMapResponse(string mapId, ExplorationNode[] nodes)
        {
            return new ExplorationMapResponse
            {
                MapId = mapId,
                Nodes = nodes.Select(n => new ExplorationNodeResponse
                {
                    Id = n.Id,
                    Level = n.Level,
                    Lane = n.Lane.ToString(),
                    Type = n.Type.ToString(),
                    Visited = n.Visited,
                    OutgoingPaths = n.OutgoingPaths.Select(p => new ExplorationPathResponse
                    {
                        ToNodeId = p.ToNodeId
                    }).ToList()
                }).ToList()
            };
        }
    }
}