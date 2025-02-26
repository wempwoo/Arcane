import mongoose, { Document, Schema } from 'mongoose';

// プレイヤードキュメントのインターフェース
export interface IPlayer extends Document {
  deviceId: string;        // デバイスの一意識別子
  nickname?: string;       // オプションのニックネーム
  gameData: any;           // ゲームの進行状況やセーブデータ
  lastLogin: Date;         // 最終ログイン日時
  createdAt: Date;         // アカウント作成日時
}

// プレイヤースキーマの定義
const PlayerSchema = new Schema<IPlayer>({
  deviceId: {
    type: String,
    required: [true, 'デバイスIDは必須です'],
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [20, 'ニックネームは20文字以下である必要があります']
  },
  gameData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // createdAt、updatedAtフィールドを自動で管理
});

// モデルの作成と輸出
const Player = mongoose.model<IPlayer>('Player', PlayerSchema);

export default Player;