# フロントエンド認証実装計画

## 概要
探索マップAPIに追加された認証機能に対応するため、フロントエンドの認証実装を行います。
シンプルで保守性の高い実装を目指し、認証に関する処理を一元的に管理します。

この実装計画に至った検討過程の詳細は [実装検討の覚書](../architectures/notes/frontend_auth_implementation_notes.md) を参照してください。

## ファイル構成

```
client/src/
├── auth/
│   ├── storage/
│   │   ├── types.ts          # ストレージインターフェース
│   │   ├── web.ts           # Web環境用実装
│   │   ├── native.ts        # ネイティブ環境用実装
│   │   └── index.ts         # 環境に応じた初期化
│   ├── device.ts            # デバイスID管理
│   ├── token.ts             # トークン管理
│   └── errors.ts            # 認証関連エラー定義
├── api/
│   ├── request.ts           # 認証付きリクエスト関数
│   └── exploration.ts       # 探索マップAPI
└── scenes/
    ├── ErrorHandlingScene.ts # エラーハンドリング用シーン
    └── exploration/
        └── api.ts           # 既存APIを移行
```

## 主要コンポーネント

### 1. ストレージ管理
- 環境に応じた適切なストレージ戦略を使用
- Web環境: LocalStorage + IndexedDB（バックアップ）
- ネイティブ環境: Capacitor Preferences API

```typescript
// storage/types.ts
export interface StorageStrategy {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
}

// storage/index.ts
export const initializeStorage = async (): Promise<StorageStrategy> => {
    try {
        await Preferences.get({ key: 'test' });
        return new NativeStorage();
    } catch {
        return new WebStorage();
    }
};
```

### 2. デバイスID管理
- Capacitor Device APIを優先使用
- フォールバックとしてブラウザフィンガープリントを使用
- 生成したIDを永続化

```typescript
export const getDeviceId = async (): Promise<string> => {
    const storage = await initializeStorage();
    const stored = await storage.get('deviceId');
    if (stored) return stored;

    const id = await generateDeviceId();
    await storage.set('deviceId', id);
    return id;
};
```

### 3. トークン管理
- シンプルなメモリキャッシュ
- ストレージとの同期
- 最小限の状態管理

```typescript
let currentToken: string | null = null;

export const getToken = async (): Promise<string | null> => {
    if (currentToken) return currentToken;
    const storage = await initializeStorage();
    return storage.get('token');
};

export const setToken = async (token: string): Promise<void> => {
    currentToken = token;
    const storage = await initializeStorage();
    await storage.set('token', token);
};
```

### 4. エラー定義
- 認証エラーの種類を明確に区別
- エラーハンドリングの一元化をサポート

```typescript
export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class DeviceAuthenticationError extends AuthenticationError {
    constructor() {
        super('Device authentication failed. User data may be lost.');
        this.name = 'DeviceAuthenticationError';
    }
}
```

### 5. 認証付きリクエスト
- 認証ヘッダーの自動付与
- トークン期限切れの自動リフレッシュ
- エラーハンドリングの一元化

```typescript
export const authenticatedRequest = async (
    endpoint: string,
    options: RequestOptions = {}
): Promise<Response> => {
    try {
        const token = await getToken();
        if (!token) {
            await authenticate();
        }

        const response = await fetch(endpoint, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${await getToken()}`
            }
        });

        if (response.status === 401) {
            await authenticate();
            return fetch(endpoint, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${await getToken()}`
                }
            });
        }

        return response;
    } catch (error) {
        ErrorHandlingScene.handleError(error as Error);
        throw error;
    }
};
```

### 6. エラーハンドリング
- グローバルなエラーハンドリング
- エラーの種類に応じた適切な処理
- 将来的なエラー画面実装への準備

```typescript
export class ErrorHandlingScene extends Scene {
    private static instance: ErrorHandlingScene;

    constructor() {
        super({ key: 'ErrorHandlingScene' });
        ErrorHandlingScene.instance = this;
    }

    static handleError(error: Error): void {
        if (error instanceof DeviceAuthenticationError) {
            // TODO: デバイス認証エラー画面を表示
            console.error('Device authentication failed');
            this.instance.scene.start('TitleScene');
            return;
        }

        if (error instanceof AuthenticationError) {
            console.error('Authentication failed:', error);
            return;
        }

        console.error('Unexpected error:', error);
    }
}
```

## 実装手順

1. 依存パッケージの導入
   - @capacitor/preferences
   - @capacitor/device

2. 基本機能の実装
   - ストレージ管理（Web/Native）
   - デバイスID生成・管理
   - トークン管理
   - エラー定義

3. 認証機能の実装
   - 認証付きリクエスト関数
   - エラーハンドリングシーン
   - 既存APIの移行

4. テストと動作確認
   - Web環境での動作確認
   - ネイティブ環境での動作確認
   - エラーハンドリングの確認

## 注意点

1. エラーハンドリング
   - トークン期限切れは自動的に再認証・リトライ
   - デバイスID無効は処理を中断
   - エラー画面実装は今回はTODO扱い

2. 状態管理
   - シンプルなメモリキャッシュを使用
   - 必要に応じて拡張可能な設計

3. テスト容易性
   - 関数ベースの実装で単体テストが容易
   - モック化が簡単な設計

4. 環境対応
   - Web環境とネイティブ環境の両方に対応
   - 適切なストレージ戦略の自動選択
   - フォールバック機能の実装