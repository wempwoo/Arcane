import express from 'express';
import { authenticate, protect } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/playerController';

const router = express.Router();

// デバイスIDによる認証/登録
router.post('/auth', authenticate, (req, res) => {
  // authenticate ミドルウェアがトークンをセット
  res.status(200).json({
    success: true,
    token: res.locals.token,
    player: {
      id: req.player._id,
      nickname: req.player.nickname,
      lastLogin: req.player.lastLogin,
      createdAt: req.player.createdAt
    }
  });
});

// 認証が必要なルート
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;