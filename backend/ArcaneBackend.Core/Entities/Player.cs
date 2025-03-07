using ArcaneBackend.Core.Enums;

namespace ArcaneBackend.Core.Entities;

/// <summary>
/// プレイヤー情報を表すエンティティ
/// </summary>
public class Player
{
    /// <summary>
    /// プレイヤーの一意識別子
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// デバイスの一意識別子
    /// </summary>
    public required string DeviceId { get; set; }

    /// <summary>
    /// デバイスの種類
    /// </summary>
    public required DeviceType DeviceType { get; set; }
    
    /// <summary>
    /// プレイヤーのニックネーム
    /// </summary>
    public string? Nickname { get; set; }
    
    /// <summary>
    /// 最終ログイン日時
    /// </summary>
    public DateTime LastLoginAt { get; set; }
    
    /// <summary>
    /// アカウント作成日時
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// 最終更新日時
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}