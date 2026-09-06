import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import * as UsersController from '../controllers/users.controller';

const router = Router();

router.get('/me', ...requireAuth, UsersController.getMe);
router.patch('/me', ...requireAuth, UsersController.updateMe);

export default router;
