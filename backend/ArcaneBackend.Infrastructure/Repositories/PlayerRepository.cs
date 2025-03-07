using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Interfaces;
using ArcaneBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ArcaneBackend.Infrastructure.Repositories;

public class PlayerRepository : IPlayerRepository
{
    private readonly ArcaneDbContext _context;

    public PlayerRepository(ArcaneDbContext context)
    {
        _context = context;
    }

    public async Task<Player?> GetByIdAsync(Guid id)
    {
        return await _context.Players.FindAsync(id);
    }

    public async Task<IEnumerable<Player>> GetAllAsync()
    {
        return await _context.Players.ToListAsync();
    }

    public async Task<Player> AddAsync(Player player)
    {
        player.CreatedAt = DateTime.UtcNow;
        player.UpdatedAt = DateTime.UtcNow;
        player.LastLoginAt = DateTime.UtcNow;
        
        _context.Players.Add(player);
        await _context.SaveChangesAsync();
        return player;
    }

    public async Task<Player> UpdateAsync(Player player)
    {
        var existingPlayer = await _context.Players.FindAsync(player.Id)
            ?? throw new KeyNotFoundException($"Player with ID {player.Id} not found.");

        // Update only mutable properties
        existingPlayer.Nickname = player.Nickname;
        existingPlayer.LastLoginAt = DateTime.UtcNow;
        existingPlayer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existingPlayer;
    }

    public async Task DeleteAsync(Guid id)
    {
        var player = await _context.Players.FindAsync(id)
            ?? throw new KeyNotFoundException($"Player with ID {id} not found.");

        _context.Players.Remove(player);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Players.AnyAsync(p => p.Id == id);
    }

    public async Task<Player?> GetByDeviceIdAsync(string deviceId)
    {
        return await _context.Players
            .FirstOrDefaultAsync(p => p.DeviceId == deviceId);
    }

    public async Task<bool> ExistsByDeviceIdAsync(string deviceId)
    {
        return await _context.Players.AnyAsync(p => p.DeviceId == deviceId);
    }
}