# マップ生成API認証実装計画

## 現状分析

### 実装済みの機能
- JWT認証の基本設定（Program.cs）
- トークン生成と検証（AuthService）
- デバイスIDベースの認証（AuthController）
- マップ生成の基本機能（ExplorationMapController）

### 現在の課題
- マップデータがプレイヤーと紐付いていない
- 認証が無効化されている（[Authorize]属性がコメントアウト）
- プレイヤー固有のマップアクセス制御がない

## 実装手順

### 1. データモデルの拡張
- ExplorationNodeエンティティにPlayerId（Guid）を追加
- マイグレーションの作成と適用

### 2. サービス層の修正
- IExplorationMapServiceの拡張
  ```csharp
  Task<string> GenerateMapAsync(int maxLevel, Guid playerId);
  Task<ExplorationNode[]> GetMapNodesAsync(string mapId, Guid playerId);
  Task MarkNodeAsVisitedAsync(int nodeId, Guid playerId);
  ```
- ExplorationMapServiceの実装更新
  - プレイヤーIDによるフィルタリング
  - 所有権チェックの追加

### 3. コントローラーの認証実装
- [Authorize]属性の有効化
- HttpContext.UserからプレイヤーID取得
  ```csharp
  var playerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
      ?? throw new InvalidOperationException("Player ID not found in token"));
  ```
- 各エンドポイントでのプレイヤーID利用

### 4. エラーハンドリング
- 未認証アクセスの適切なエラーレスポンス
- 不正なマップアクセスの403 Forbidden応答
- プレイヤーID取得失敗時の500エラー防止

## セキュリティ考慮事項

### アクセス制御
- プレイヤーは自身のマップのみアクセス可能
- マップIDの推測防止（UUIDなど）
- 不正なノードアクセスの防止

### トークン管理
- トークンの有効期限確認
- リフレッシュトークンフローの確認
- デバイスIDの検証

## テスト計画

### 単体テスト
- ExplorationMapServiceのプレイヤーID検証
- 不正アクセス時の例外発生確認

### 統合テスト
- 認証トークンを使用したAPIアクセス
- 異なるプレイヤーのマップアクセス試行
- トークン期限切れの動作確認

### エンドツーエンドテスト
- クライアントからの認証付きリクエスト
- エラーケースのハンドリング確認

## 実装スケジュール

1. データモデル拡張（0.5日）
2. サービス層修正（1日）
3. コントローラー実装（0.5日）
4. テスト実装と検証（1日）

## 成功基準

- ✅ 認証なしのアクセスが拒否される
- ✅ プレイヤーが自身のマップのみアクセス可能
- ✅ 適切なエラーレスポンスが返却される
- ✅ 全テストが成功する