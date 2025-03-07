using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ArcaneBackend.Core.Entities;
using ArcaneBackend.Core.Enums;
using ArcaneBackend.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ArcaneBackend.Infrastructure.Services;

/// <summary>
/// JWT認証サービスの実装
/// </summary>
public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly IPlayerRepository _playerRepository;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _tokenExpirationDays;

    public AuthService(
        IConfiguration configuration,
        IPlayerRepository playerRepository)
    {
        _configuration = configuration;
        _playerRepository = playerRepository;
        
        _secretKey = _configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT secret key is not configured");
        _issuer = _configuration["Jwt:Issuer"] ?? "ArcaneBackend";
        _audience = _configuration["Jwt:Audience"] ?? "ArcaneGame";
        _tokenExpirationDays = int.Parse(_configuration["Jwt:TokenExpirationDays"] ?? "30");
    }

    /// <inheritdoc/>
    public async Task<AuthResult> AuthenticateDeviceAsync(string deviceId, DeviceType deviceType)
    {
        // デバイスIDで既存プレイヤーを検索
        var player = await _playerRepository.GetByDeviceIdAsync(deviceId);

        // 存在しない場合は新規作成
        if (player == null)
        {
            player = new Player
            {
                Id = Guid.NewGuid(),
                DeviceId = deviceId,
                DeviceType = deviceType,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _playerRepository.AddAsync(player);
        }
        else
        {
            // 既存プレイヤーの場合はログイン時刻を更新
            player.LastLoginAt = DateTime.UtcNow;
            player.UpdatedAt = DateTime.UtcNow;
            await _playerRepository.UpdateAsync(player);
        }

        // JWTトークンを生成
        var token = GenerateJwtToken(player);

        return new AuthResult(
            player.Id,
            token,
            _tokenExpirationDays * 24 * 60 * 60, // 有効期限（秒）
            player.DeviceId,
            player.DeviceType
        );
    }

    /// <inheritdoc/>
    public bool ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_secretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc/>
    public Guid GetPlayerIdFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(token);
        var playerIdClaim = jwtToken.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier);
        return Guid.Parse(playerIdClaim.Value);
    }

    private string GenerateJwtToken(Player player)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, player.Id.ToString()),
            new Claim(ClaimTypes.Name, player.Nickname ?? "Unknown Player"),
            new Claim("deviceId", player.DeviceId),
            new Claim("deviceType", player.DeviceType.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(_tokenExpirationDays),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}