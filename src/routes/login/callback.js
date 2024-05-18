import { Router } from 'express';
import { generateAccessToken, getUserIdentity } from '../../adapters/discord.js';
import { checkUserExists, insertUser, updateUser } from '../../database/user.js';
const router = Router();

router.get('/callback', async(req, res) => {
	const { code, state } = req.query;
	const { wordgen_oauth_state } = req.cookies;

	if (!wordgen_oauth_state || wordgen_oauth_state !== state) {
		res.clearCookie('wordgen_oauth_state');
		res.redirect('/');
		return;
	}

	const tokens = await generateAccessToken(code);
	const user = await getUserIdentity(tokens.access_token);

	const userExists = checkUserExists(undefined, user.id, user.username);

	if (userExists) {
		updateUser(
			userExists.id,
			user.username,
			tokens.access_token,
			tokens.refresh_token,
			Date.now() + (tokens.expires_in * 1000),
		);
	} else {
		insertUser(
			user.username,
			user.id,
			tokens.access_token,
			tokens.refresh_token,
			Date.now() + (tokens.expires_in * 1000),
		);
	}

	res.clearCookie('wordgen_oauth_state');
	res.cookie('wordgen_oauth_token', tokens.access_token, {
		httpOnly: true,
		maxAge: tokens.expires_in * 1000,
	});
	res.cookie('wordgen_oauth_expires_at', Date.now() + (tokens.expires_in * 1000), {
		httpOnly: true,
		maxAge: tokens.expires_in * 1000,
	});

	res.redirect('/game');
});

export default router;
