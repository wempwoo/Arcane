# バックエンド開発計画

## 前提
- この計画は、docs/architectures/gcp_dtnet_analysis.mdの内容を目指したものである。
- 現状のバックエンド実装（serverディレクトリ）はほぼ仮の実装で、破棄して良い。
- DBもまだ作っていないので、データ移行も不要。

## フェーズ1: ローカル開発環境の構築

### プロジェクト構成
- WebAPIプロジェクト（Arcane.API）
- ドメインロジック（Arcane.Core）
- インフラ層（Arcane.Infrastructure）
- テストプロジェクト（Arcane.Tests）

### 開発環境
- メイン開発環境
  - VSCode
  - Roo Code（C#開発用）
  - .NET 8 SDK
- 補助的な開発環境
  - Visual Studio 2022（複雑なデバッグ時に使用）
- データベース環境
  - PostgreSQL 15
  - Docker Desktop

### 開発ツール
- Entity Framework Core PostgreSQLプロバイダー
- データベースマイグレーションツール
- Git（バージョン管理）

## フェーズ2: サンプルAPIの実装

### データモデル設計
- プレイヤー情報の基本モデル
- 魔導機の基本モデル
- Entity Framework Coreでのマッピング設定

### 基本機能実装
- プレイヤー情報のCRUD操作
- 魔導機の基本操作
- JWT認証の基本実装
  - 参照: docs\architectures\jwt_authentication_design.md
- Swagger UIでのAPI文書化

## フェーズ3: Docker環境の準備

### 開発環境のコンテナ化
- APIアプリケーションのコンテナ化
- PostgreSQLコンテナの設定
- docker-composeによるローカル環境構築
- 開発・テスト環境の統一

### データベース設定
- マイグレーション管理
- 初期データの設定
- 開発用データの準備
- PostgreSQL固有の機能活用（JSONBなど）

## フェーズ4: クラウド準備

### Google Cloud環境
- プロジェクト作成
- 必要なAPIの有効化
- 認証情報の準備

### Cloud SQL (PostgreSQL)設定
- インスタンスの設計
- バックアップ設定
- 接続設定
- セキュリティ設定

### デプロイ設定
- Cloud Runの設定準備
- Cloud SQLプロキシの設定
- CI/CDパイプラインの設計

## 実装時の注意点

### セキュリティ
- 環境変数での機密情報管理
- HTTPS通信の設定
- CORS設定の管理方針
- PostgreSQL固有のセキュリティ設定

### パフォーマンス
- PostgreSQLのインデックス最適化
- キャッシュ戦略の検討
- N+1問題への対応方針
- クエリパフォーマンスの監視

### 運用管理
- ログ管理の方針
- 監視設定の検討
- バックアップ戦略
- データベースメンテナンス計画