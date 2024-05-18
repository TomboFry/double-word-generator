import { Router } from 'express';
import auth from './auth.js';
import callback from './callback.js';

const router = Router();

router.use(auth);
router.use(callback);

export default router;
