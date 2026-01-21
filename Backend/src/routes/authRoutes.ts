import { Router } from 'express';
import * as authController from '../controllers/authController.ts';
import { registerLimiter } from '../middleware/rateLimiter.ts';
import { loginLimiter } from '../middleware/rateLimiter.ts';
import { authenticate } from '../middleware/authMiddleware.ts';

const router = Router();

// Rota de registo com proteção de Rate Limit
router.post('/register', registerLimiter, authController.register);

router.post('/login', loginLimiter, authController.login);

// Rota Protegida (Exemplo de Perfil)
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'Acesso autorizado', user: req.user });
});

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/verify-email', authController.verifyEmail);

export default router;