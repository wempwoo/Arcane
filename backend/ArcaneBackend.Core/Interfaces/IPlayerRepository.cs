using ArcaneBackend.Core.Entities;

namespace ArcaneBackend.Core.Interfaces;

public interface IPlayerRepository
{
    Task<Player?> GetByIdAsync(Guid id);
    Task<IEnumerable<Player>> GetAllAsync();
    Task<Player> AddAsync(Player player);
    Task<Player> UpdateAsync(Player player);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}