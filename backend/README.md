# Arcane Backend

魔導機アプリケーションのバックエンドAPI

## 必要な環境

- .NET 8 SDK
- Docker Desktop
- PostgreSQL 15（Docker経由で提供）

## セットアップ手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd backend
```

2. データベースの起動
```bash
# プロジェクトルートディレクトリで実行
docker compose up -d
```

3. データベースマイグレーションの実行
```bash
cd backend
dotnet ef database update --project ArcaneBackend.Infrastructure --startup-project ArcaneBackend.API
```

4. APIの起動
```bash
cd ArcaneBackend.API
dotnet run
```

デフォルトでは http://localhost:5170 でサーバーが起動します。
Swagger UIは http://localhost:5170 で確認できます。

## 開発用コマンド

### ビルド
```bash
dotnet build
```

### テストの実行
```bash
dotnet test
```

### マイグレーション

新しいマイグレーションの作成:
```bash
dotnet ef migrations add [MigrationName] --project ArcaneBackend.Infrastructure --startup-project ArcaneBackend.API
```

マイグレーションの適用:
```bash
dotnet ef database update --project ArcaneBackend.Infrastructure --startup-project ArcaneBackend.API
```

## API概要

APIの詳細な仕様は、Swagger UI（http://localhost:5170）で確認できます。
各エンドポイントの説明、リクエスト/レスポンスの形式、必要なパラメータなどが全て文書化されています。

## プロジェクト構成

- `ArcaneBackend.API` - WebAPIプロジェクト
- `ArcaneBackend.Core` - ドメインロジック
- `ArcaneBackend.Infrastructure` - インフラ層（データベースアクセスなど）
- `ArcaneBackend.Tests` - テストプロジェクト