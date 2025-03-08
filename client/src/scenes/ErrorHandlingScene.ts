import Phaser from 'phaser';
import { DeviceAuthenticationError } from '../auth/errors';

export class ErrorHandlingScene extends Phaser.Scene {
  private static instance: ErrorHandlingScene | null = null;

  constructor() {
    super({ key: 'ErrorHandlingScene' });
    ErrorHandlingScene.instance = this;
  }

  create() {
    // シーン初期化時の処理（必要に応じて追加）
  }

  static handleError(error: Error): void {
    if (!this.instance) {
      console.error('ErrorHandlingScene not initialized');
      return;
    }

    if (error instanceof DeviceAuthenticationError) {
      // デバイス認証エラー時の処理
      console.error('Device authentication failed');
      
      // エラーモーダルの表示（仮実装）
      this.instance.showErrorModal(
        'デバイス認証エラー', 
        'デバイスの認証に失敗しました。アプリを再起動してください。'
      );

      // タイトルシーンに戻る
      this.instance.scene.start('TitleScene');
      return;
    }

    // その他の一般的なエラー処理
    console.error('Unexpected error:', error);
    this.instance.showGenericErrorModal(error);
  }

  private showErrorModal(title: string, message: string) {
    // TODO: 実際のエラーモーダル実装
    // 現時点では単純なアラートを使用
    alert(`${title}\n${message}`);
  }

  private showGenericErrorModal(error: Error) {
    // TODO: 一般的なエラーモーダルの実装
    alert(`エラーが発生しました：${error.message}`);
  }
}