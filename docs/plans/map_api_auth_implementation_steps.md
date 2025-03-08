# マップAPI認証実装手順

## 認証を先に実装する理由

1. プレイヤーIDの取得方法
   - [Authorize]属性を有効化することで、`HttpContext.User`からプレイヤーIDが取得可能
   - これにより、実際のプレイヤーIDを使ってテストが可能

2. 開発効率
   - 認証なしで実装すると、プレイヤーIDを仮実装する必要がある
   - 後で認証を入れる際に、仮実装部分の修正が必要になる

## 実装手順

### 1. [Authorize]属性の有効化
```csharp
[Authorize]
[ApiController]
[Route("api/exploration-maps")]
public class ExplorationMapController : ControllerBase
```

### 2. プレイヤーID取得メソッドの実装
```csharp
private Guid GetCurrentPlayerId()
{
    var playerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (playerIdClaim == null)
    {
        throw new InvalidOperationException("Player ID not found in token");
    }
    return Guid.Parse(playerIdClaim.Value);
}
```

### 3. 動作確認
1. Swaggerで認証テスト
   - デバイス認証でトークン取得
   - 取得したトークンでマップ生成APIを呼び出し

2. エラーケースの確認
   - 認証なしでのアクセス → 401エラー
   - 不正なトークン → 401エラー
   - トークン期限切れ → 401エラー

### 4. 次のステップ（プレイヤー紐付け）の準備
- プレイヤーIDが正しく取得できることを確認
- マップデータとプレイヤーの紐付け設計の詳細化
- データベース設計の更新計画

## 注意点

1. クライアント側の対応
   - トークンの保存方法
   - 401エラー時のリフレッシュフロー
   - エラーハンドリングの実装

2. テスト方法
   - 単体テストでの認証モック
   - 統合テストでの実トークン使用

3. エラーハンドリング
   - プレイヤーID取得失敗時の適切なエラーメッセージ
   - クライアントへの明確なエラー情報の提供