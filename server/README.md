# Arcane Game Server

モバイルゲーム「Arcane」のバックエンドサーバーです。

## 技術スタック

- **Node.js + Express.js**（TypeScript）
  - REST API構築
  - WebSocketによるリアルタイム通信

- **MongoDB**
  - ゲームデータの保存

- **認証**
  - デバイスIDベースの認証
  - JWTトークン

## プロジェクト構造

```
server/
├── src/
│   ├── config/         - 設定ファイル
│   ├── controllers/    - ルートハンドラー
│   ├── middleware/     - ミドルウェア
│   ├── models/         - データモデル
│   ├── routes/         - ルート定義
│   ├── utils/          - ユーティリティ関数
│   └── index.ts        - エントリーポイント
├── .env                - 環境変数（非公開）
├── .env.example        - 環境変数の例
├── package.json        - パッケージ設定
└── tsconfig.json       - TypeScript設定
```

## 主要なAPI

### プレイヤー認証

```
POST /api/players/auth
```

- **リクエスト**: デバイスIDを送信
- **レスポンス**: JWTトークンとプレイヤー情報

### プロファイル取得

```
GET /api/players/profile
```

- **認証**: 必要（Bearerトークン）
- **レスポンス**: プレイヤーのプロファイル情報

### プロファイル更新

```
PUT /api/players/profile
```

- **認証**: 必要（Bearerトークン）
- **リクエスト**: 更新するフィールド（nickname等）
- **レスポンス**: 更新されたプレイヤー情報

### ゲームデータ同期

```
POST /api/players/sync
```

- **認証**: 必要（Bearerトークン）
- **リクエスト**: 同期するゲームデータ
- **レスポンス**: 同期後のゲームデータ

## 開発手順

1. 依存関係のインストール
   ```
   npm install
   ```

2. 開発サーバーの起動
   ```
   npm run dev
   ```

3. ビルド
   ```
   npm run build
   ```

4. 本番環境での起動
   ```
   npm start