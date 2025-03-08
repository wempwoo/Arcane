using System.Security.Claims;

namespace ArcaneBackend.API.Utils
{
    /// <summary>
    /// 認証関連のユーティリティメソッドを提供するクラス
    /// </summary>
    public static class AuthUtils
    {
        /// <summary>
        /// ClaimsPrincipalからプレイヤーIDを取得します
        /// </summary>
        /// <param name="user">認証済みのユーザー情報</param>
        /// <returns>プレイヤーのGUID</returns>
        /// <exception cref="UnauthorizedAccessException">プレイヤーIDが見つからない場合</exception>
        public static Guid GetCurrentPlayerId(ClaimsPrincipal user)
        {
            var playerIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (playerIdClaim == null)
            {
                throw new UnauthorizedAccessException("プレイヤーIDが見つかりません。");
            }
            return Guid.Parse(playerIdClaim.Value);
        }
    }
}