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
    
    /// <summary>
    /// デバイスIDでプレイヤーを検索します
    /// </summary>
    /// <param name="deviceId">デバイスの一意識別子</param>
    /// <returns>プレイヤー情報、存在しない場合はnull</returns>
    Task<Player?> GetByDeviceIdAsync(string deviceId);
    
    /// <summary>
    /// デバイスIDの存在確認を行います
    /// </summary>
    /// <param name="deviceId">デバイスの一意識別子</param>
    /// <returns>存在する場合はtrue</returns>
    Task<bool> ExistsByDeviceIdAsync(string deviceId);
}