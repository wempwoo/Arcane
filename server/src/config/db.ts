import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/arcane_game';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB接続成功');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB接続エラー:', error.message);
    } else {
      console.error('MongoDB接続中に不明なエラーが発生しました');
    }
    // 深刻なエラーの場合はプロセスを終了
    process.exit(1);
  }
};

export default connectDB;