export interface StorageStrategy {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}