using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ArcaneBackend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayersController : ControllerBase
{
    private readonly IPlayerRepository _playerRepository;

    public PlayersController(IPlayerRepository playerRepository)
    {
        _playerRepository = playerRepository;
    }

    /// <summary>
    /// プレイヤー一覧を取得
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Player>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<Player>>> GetPlayers()
    {
        var players = await _playerRepository.GetAllAsync();
        return Ok(players);
    }

    /// <summary>
    /// 指定したIDのプレイヤーを取得
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Player), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Player>> GetPlayer(Guid id)
    {
        var player = await _playerRepository.GetByIdAsync(id);
        if (player == null)
        {
            return NotFound();
        }
        return Ok(player);
    }

    /// <summary>
    /// 新規プレイヤーを作成
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Player), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Player>> CreatePlayer(Player player)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdPlayer = await _playerRepository.AddAsync(player);
        return CreatedAtAction(
            nameof(GetPlayer),
            new { id = createdPlayer.Id },
            createdPlayer);
    }

    /// <summary>
    /// プレイヤー情報を更新
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Player), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Player>> UpdatePlayer(Guid id, Player player)
    {
        if (id != player.Id)
        {
            return BadRequest("ID mismatch");
        }

        try
        {
            var updatedPlayer = await _playerRepository.UpdateAsync(player);
            return Ok(updatedPlayer);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    /// <summary>
    /// プレイヤーを削除
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePlayer(Guid id)
    {
        try
        {
            await _playerRepository.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}