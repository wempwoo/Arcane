# Arcane - モバイルゲーム開発プロジェクト

Phaser.js + CapacitorJSを使用したモバイルゲーム開発プロジェクトです。

## プロジェクト構成

- **フロントエンド** (`/client`): Phaser.js + TypeScript
- **バックエンド** (`/server`): Node.js + Express + TypeScript

## ローカル開発環境のセットアップ

### フロントエンド (client)

```bash
# 依存関係のインストール
cd client
npm install

# 開発サーバーの起動
npm start
```

開発サーバーは http://localhost:8080 で起動します。

### バックエンド (server)

```bash
# 依存関係のインストール
cd server
npm install

# 開発サーバーの起動
npm run dev
```

バックエンドサーバーは http://localhost:5000 で起動します。

## 開発内容

### フロントエンド

- **Phaser.js**: 2Dゲーム開発フレームワーク
- **TypeScript**: 型安全な開発
- **WebPack**: モジュールバンドラー
- **CapacitorJS**: iOSおよびAndroidへのデプロイ

### バックエンド

- **Express.js**: RESTful API
- **Socket.IO**: リアルタイム通信（必要に応じて）
- **JWT認証**: デバイスIDベースの認証
- **MongoDB**: データストア（本番環境用）

## ディレクトリ構造

```
/
├── client/             - フロントエンドコード
│   ├── src/            - ソースコード
│   │   ├── game.ts     - ゲームのメインファイル
│   │   ├── services/   - サービス（API通信など）
│   │   └── assets/     - ゲームアセット
│   └── ...
│
└── server/             - バックエンドコード
    ├── src/            - ソースコード
    │   ├── index.ts    - エントリーポイント
    │   ├── config/     - 設定ファイル
    │   ├── controllers/ - ルートハンドラー
    │   ├── middleware/ - ミドルウェア
    │   ├── models/     - データモデル
    │   ├── routes/     - ルート定義
    │   └── utils/      - ユーティリティ
    └── ...
```

## 現在の機能

- **プレイヤー認証**: デバイスIDベースの匿名認証
- **プレイヤープロファイル**: プレイヤー情報の取得・更新
- **ゲームデータ同期**: サーバーとのゲームデータ同期

## 今後の開発プラン

- より充実したゲームコンテンツの実装
- CapacitorJSを使用したネイティブビルド設定
- MongoDBによる永続ストレージの実装
- ユーザーインターフェースの改善
- リーダーボードやマルチプレイヤー機能の追加

## ビルドと配布

### Webビルド

```bash
cd client
npm run build
```

### モバイルビルド (将来実装予定)

```bash
# Capacitorの初期化とプラットフォーム追加
cd client
npm run cap:init
npm run cap:add:android
npm run cap:add:ios

# 同期とビルド
npm run build
npm run cap:sync