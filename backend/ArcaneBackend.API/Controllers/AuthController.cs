using ArcaneBackend.Core.Enums;
using ArcaneBackend.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ArcaneBackend.API.Controllers;

/// <summary>
/// 認証関連のエンドポイントを提供するコントローラー
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// デバイスIDを使用して認証を行います
    /// </summary>
    /// <param name="request">認証リクエスト</param>
    /// <returns>認証結果とトークン</returns>
    [HttpPost("device")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponse>> AuthenticateDevice(AuthRequest request)
    {
        if (!Enum.TryParse<DeviceType>(request.DeviceType, true, out var deviceType))
        {
            return BadRequest(new { error = "Invalid device type" });
        }

        var result = await _authService.AuthenticateDeviceAsync(request.DeviceId, deviceType);

        var response = new AuthResponse(
            result.PlayerId,
            result.Token,
            result.ExpiresIn,
            result.DeviceId,
            result.DeviceType.ToString()
        );

        return Ok(response);
    }
}

/// <summary>
/// 認証リクエストのモデル
/// </summary>
public record AuthRequest(
    string DeviceId,
    string DeviceType
);

/// <summary>
/// 認証レスポンスのモデル
/// </summary>
public record AuthResponse(
    Guid PlayerId,
    string Token,
    int ExpiresIn,
    string DeviceId,
    string DeviceType
);