# フロントエンド認証実装の検討過程

## 1. 実装パターンの検討

### クラスベース vs 関数ベース
当初、AuthServiceやAPIClientをクラスとして実装することを検討。

```typescript
class APIClient {
    protected async request(endpoint: string, options: RequestOptions) { ... }
}

class ExplorationMapAPI extends APIClient {
    async generateMap(maxLevel: number) {
        return this.request('/exploration-maps', { 
            method: 'POST', 
            body: { maxLevel } 
        });
    }
}
```

しかし、以下の理由で関数ベースの実装に決定：
- 状態管理が最小限で済む
- テストが容易
- コードがシンプルで理解しやすい

### 状態管理の検討
当初、RxJSを使用した状態管理を検討：

```typescript
export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    lastRefresh: number | null;
}

export const authState$ = new BehaviorSubject<AuthState>(initialState);
```

しかし、現時点では単純なメモリキャッシュで十分と判断：
- 複雑な状態管理は不要
- 必要に応じて後から拡張可能

## 2. エラーハンドリングの検討

### 個別ハンドリング vs 一元化
当初、各シーンでtry-catchを使用する案を検討：

```typescript
export class ExplorationScene extends Scene {
    async create() {
        try {
            const map = await ExplorationAPI.generateMap(5);
            this.renderMap(map);
        } catch (error) {
            if (error instanceof DeviceAuthenticationError) {
                // エラー処理
            }
        }
    }
}
```

問題点：
- コードの重複
- エラー処理の一貫性が保てない
- 可読性の低下

解決策として、ErrorHandlingSceneによる一元化を採用：
- エラー処理の統一
- 各シーンのコードがシンプルに
- 将来的な拡張が容易

### エラーシナリオの区別
認証エラーを2つのケースに分類：

1. トークン期限切れ
   - 自動的に再認証
   - ユーザーへの影響なし

2. デバイスID無効
   - 処理を中断
   - ユーザーデータが失われる可能性
   - エラー画面での説明が必要

## 3. ストレージ戦略の検討

### Web環境とネイティブ環境の違い
環境に応じて適切なストレージを使用する必要性を確認：

```typescript
interface StorageStrategy {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
}

// Web環境用実装
class WebStorage implements StorageStrategy {
    private storage: Storage = localStorage;
    private backupStorage: IDBDatabase | null = null;

    async get(key: string): Promise<string | null> {
        // LocalStorageから取得を試みる
        const value = this.storage.getItem(key);
        if (value) return value;

        // バックアップからの復旧を試みる
        return this.getFromBackup(key);
    }

    async set(key: string, value: string): Promise<void> {
        // LocalStorageに保存
        this.storage.setItem(key, value);
        // バックアップとしてIndexedDBにも保存
        await this.backupToIndexedDB(key, value);
    }
}

// ネイティブ環境用実装
class NativeStorage implements StorageStrategy {
    async get(key: string): Promise<string | null> {
        return Preferences.get({ key }).then(result => result.value);
    }

    async set(key: string, value: string): Promise<void> {
        return Preferences.set({ key, value });
    }
}

// 環境に応じたストレージの初期化
export const initializeStorage = async (): Promise<StorageStrategy> => {
    try {
        // Capacitor Preferences APIが利用可能か確認
        await Preferences.get({ key: 'test' });
        return new NativeStorage();
    } catch {
        return new WebStorage();
    }
};
```

この方針に決定した理由：
1. 各環境に最適なストレージを使用可能
2. Web環境ではバックアップ機能を実装可能
3. 将来的な要件変更にも対応しやすい

## 4. セキュリティ考慮事項

### トークン管理
- メモリ内での保持
- 環境に応じた適切なストレージでの永続化
- 自動リフレッシュ

### デバイスID
- Capacitor Device API優先
- フォールバックとしてブラウザフィンガープリント
- 暗号化して送信

## 5. 今後の課題

1. エラー画面の実装
   - ユーザーフレンドリーなエラー表示
   - 多言語対応

2. オフライン対応
   - トークンの有効期限管理
   - 再接続時の同期

3. セキュリティ強化
   - トークンのローテーション
   - デバイスIDの暗号化