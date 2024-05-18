import { Router } from 'express';
import login from './login/index.js';
import game from './game/index.js';
import { authRequiredMiddleware } from '../adapters/discord.js';

const router = Router();

router.use('/login', login);
router.use('/game', game);
router.use('/new', (_req, res) => res.render('home'));
router.use('/', authRequiredMiddleware, (_req, res) => res.redirect('/game'));

export default router;
