# JWT認証の仕組みと[Authorize]属性の説明

## [Authorize]属性の役割

[Authorize]属性をコントローラーやアクションメソッドに付けると、以下の処理が自動的に行われます：

1. リクエストヘッダーの確認
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- クライアントから送られてきたリクエストヘッダーに、JWTトークンが含まれているか確認
- トークンが無い場合は、自動的に401 Unauthorizedを返却

2. トークンの検証
- Program.csで設定した`JwtBearerOptions`の`TokenValidationParameters`に基づいて検証
- 以下の項目を自動チェック：
  - トークンの署名が正しいか
  - トークンが期限切れでないか
  - 発行者（Issuer）は正しいか
  - 対象者（Audience）は正しいか

## 実装済みの認証基盤

既に以下の実装が完了しています：

1. Program.csでの認証設定
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"])),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
```

2. AuthServiceでのトークン生成
```csharp
// デバイスID認証成功時にトークンを生成
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, player.Id.ToString()),
    new Claim("deviceId", player.DeviceId)
};

var token = tokenHandler.CreateToken(tokenDescriptor);
```

## 認証の流れ

1. クライアント：デバイスIDで認証
```http
POST /api/auth/device
{
    "deviceId": "device123",
    "deviceType": "web"
}
```

2. サーバー：JWTトークンを生成して返却
```json
{
    "playerId": "uuid",
    "token": "eyJhbGciOiJIUzI1nIs...",
    "expiresIn": 2592000
}
```

3. クライアント：以降のリクエストにトークンを付与
```http
GET /api/exploration-maps/123
Authorization: Bearer eyJhbGciOiJIUzI1nIs...
```

4. サーバー：[Authorize]属性による自動検証
- トークンの存在確認
- トークンの有効性検証
- 認証済みユーザー情報の`HttpContext.User`への設定

## 追加実装は必要？

基本的な認証基盤は既に実装済みです。[Authorize]属性を有効化するだけで：

1. 未認証アクセスの防止
2. トークンの自動検証
3. プレイヤーIDの取得

が可能になります。

ただし、以下の実装は別途必要です：

1. プレイヤーIDとマップの紐付け
2. プレイヤー固有のアクセス制御（自分のマップだけ見れるなど）

これらはビジネスロジックの実装であり、認証基盤とは別の課題となります。