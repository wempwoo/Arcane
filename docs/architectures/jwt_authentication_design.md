# JWT認証設計

## 概要
このドキュメントでは、カジュアルゲームに適した自動認証システムの設計について説明します。
ユーザーの明示的な操作を必要としない、シームレスな認証フローを実現します。

## 認証フロー

### 1. 初回起動時のシーケンス

```mermaid
sequenceDiagram
    actor User
    participant Game
    participant API
    participant DB

    User->>Game: アプリ初回起動
    Game->>Game: デバイス固有ID生成
    Game->>API: 自動登録リクエスト（デバイスID）
    API->>DB: 新規プレイヤー作成
    DB-->>API: プレイヤー情報
    API->>API: JWTトークン生成
    API-->>Game: プレイヤー情報 + トークン
    Game->>Game: トークンをSecure Storageに保存
    Game-->>User: ゲーム開始
```

### 2. 次回以降の起動時

```mermaid
sequenceDiagram
    actor User
    participant Game
    participant API
    participant DB

    User->>Game: アプリ起動
    Game->>Game: 保存済トークン取得
    alt トークンが有効
        Game->>API: トークンで認証
        API-->>Game: 認証OK
    else トークンが無効/期限切れ
        Game->>Game: デバイスID取得
        Game->>API: 再認証リクエスト（デバイスID）
        API->>DB: プレイヤー検索
        DB-->>API: プレイヤー情報
        API->>API: 新JWTトークン生成
        API-->>Game: 新トークン
        Game->>Game: 新トークンを保存
    end
    Game-->>User: ゲーム開始
```

### 3. ゲームプレイ中のAPI利用シーケンス

```mermaid
sequenceDiagram
    participant Game
    participant API
    participant Auth
    participant GameLogic
    participant DB

    Game->>API: APIリクエスト + JWT
    
    Note over API,Auth: 認証フェーズ
    API->>Auth: JWTの検証
    Auth->>Auth: トークン有効期限チェック
    Auth->>Auth: シグネチャ検証
    Auth-->>API: 認証結果

    alt 認証成功
        Note over API,GameLogic: ビジネスロジックフェーズ
        API->>GameLogic: ゲームロジック実行
        GameLogic->>DB: 必要なデータ操作
        DB-->>GameLogic: 操作結果
        GameLogic-->>API: 処理結果
        API-->>Game: 成功レスポンス
    else 認証失敗（トークン期限切れ）
        API-->>Game: 401 Unauthorized
        Game->>Game: デバイスID取得
        Game->>API: 再認証フロー
        Note over Game,API: 次回以降の起動時と同じフロー
    end
```

## 実装のポイント

### 1. デバイス識別（Capacitor + ブラウザ）

#### Web環境
- ブラウザストレージベース
  - LocalStorage: プライマリストレージ
  - IndexedDB: バックアップストレージ
- フィンガープリント技術の利用
  - Canvas指紋
  - WebGL情報
  - ブラウザ/OS情報

#### ネイティブ環境（Capacitor）
- Device API活用
  - iOS: Capacitor Device APIでIDFVを取得
  - Android: Capacitor Device APIでAndroid IDを取得
- Preferences APIでの永続化
  - @capacitor/preferences for セキュアストレージ

#### フォールバック戦略
1. Capacitor Device API試行
2. 失敗時はブラウザベースの識別子を使用
3. どちらも失敗時は新規ID生成

### 2. トークン管理
- トークン保存：デバイスのSecure Storage利用
- トークン有効期限：比較的長め（例：30日）に設定
- 自動リフレッシュ：期限切れ時に自動で再取得

### 3. セキュリティ考慮事項
- デバイスIDの暗号化：通信時は暗号化して送信
- トークンのローテーション：定期的な更新
- 不正アクセス対策：Rate Limiting実装

### 4. エラーハンドリング
- ネットワークエラー時のリトライ
- トークン検証失敗時の自動リカバリ
- デバイスID取得失敗時の代替フロー

## APIエンドポイント

1. 初回登録/認証
```
POST /api/auth/device
Request:
{
    "deviceId": "encrypted-device-identifier",
    "deviceType": "ios|android|web"
}
Response:
{
    "playerId": "uuid",
    "token": "jwt-token",
    "expiresIn": 2592000 // 30日
}
```

2. トークン再取得
```
POST /api/auth/refresh
Request:
{
    "deviceId": "encrypted-device-identifier"
}
Response:
{
    "token": "new-jwt-token",
    "expiresIn": 2592000
}