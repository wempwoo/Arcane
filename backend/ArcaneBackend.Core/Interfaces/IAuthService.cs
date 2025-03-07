using ArcaneBackend.Core.Enums;

namespace ArcaneBackend.Core.Interfaces;

/// <summary>
/// 認証サービスのインターフェース
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// デバイスIDを使用してプレイヤーを認証し、JWTトークンを生成します
    /// </summary>
    /// <param name="deviceId">デバイスの一意識別子</param>
    /// <param name="deviceType">デバイスの種類</param>
    /// <returns>認証トークンと有効期限</returns>
    Task<AuthResult> AuthenticateDeviceAsync(string deviceId, DeviceType deviceType);

    /// <summary>
    /// JWTトークンを検証します
    /// </summary>
    /// <param name="token">検証するトークン</param>
    /// <returns>トークンが有効な場合はtrue</returns>
    bool ValidateToken(string token);

    /// <summary>
    /// トークンからプレイヤーIDを取得します
    /// </summary>
    /// <param name="token">JWTトークン</param>
    /// <returns>プレイヤーID</returns>
    Guid GetPlayerIdFromToken(string token);
}

/// <summary>
/// 認証結果を表すレコード
/// </summary>
public record AuthResult(
    Guid PlayerId,
    string Token,
    int ExpiresIn,
    string DeviceId,
    DeviceType DeviceType
);