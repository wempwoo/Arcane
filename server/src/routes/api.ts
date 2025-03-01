import express from 'express';

import playerRoutes from './player';

const router = express.Router();

// ヘルスチェック
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// プレイヤールート
router.use('/players', playerRoutes);

export default router;