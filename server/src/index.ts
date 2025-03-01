import { createServer } from 'http';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';

import apiRoutes from './routes/api';

// 環境変数の読み込み
dotenv.config();

// Expressアプリケーションの作成
const app = express();
const httpServer = createServer(app);

// ソケット設定
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB接続は一時的にコメントアウト
// connectDB();

// APIルートの設定
app.use('/api', apiRoutes);

// 基本のルート
app.get('/', (req, res) => {
  res.json({ message: 'Arcane Game API Server' });
});

// Socket.IO接続設定
io.on('connection', (socket) => {
  console.log('ユーザーが接続しました: ', socket.id);

  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました: ', socket.id);
  });

  // ゲーム固有のイベントはここに追加します
});

// サーバーの起動
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV}`);
});

// エラーハンドリング
process.on('unhandledRejection', (err: Error) => {
  console.log('未処理の例外: ', err.message);
  // サーバーを正常に終了
  httpServer.close(() => process.exit(1));
});