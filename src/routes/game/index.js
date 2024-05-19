import { Router } from 'express';
import { authRequiredMiddleware } from '../../adapters/discord.js';
import { generateCombo, getUserFavouriteWords, insertVote } from '../../database/words.js';

const router = Router();

router.use(authRequiredMiddleware);

router.get('/', (req, res) => {
	res.render('game', {
		favourites: JSON.stringify(getUserFavouriteWords(req.user_id))
	});
});

router.get('/word', (req, res) => res.send(generateCombo(req.user_id)));

router.post('/vote', (req, res) => {
	const { combo_id, score } = req.body;
	if (score > 1 || score < -1 || !Number.isSafeInteger(score)) {
		res.status(400).send('sure, bro.');
		return;
	}

	insertVote(combo_id, req.user_id, score);

	res.send(generateCombo(req.user_id));
});

export default router;
