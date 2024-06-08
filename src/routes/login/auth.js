import { Router } from 'express';
import { nanoid } from 'nanoid';
const router = Router();

router.get('/auth', (req, res) => {
	const state = nanoid();
	const options = new URLSearchParams({
		client_id: process.env.WORDGEN_DISCORD_CLIENT_ID,
		redirect_uri: process.env.WORDGEN_DISCORD_REDIRECT_URI + '/login/callback',
		scope: process.env.WORDGEN_DISCORD_SCOPES,
		response_type: 'code',
		prompt: 'none',
		state,
	}).toString();

	res.cookie('wordgen_oauth_state', state, {
		expires: new Date(Date.now() + 60000),
		httpOnly: true,
	});

	res.redirect(process.env.WORDGEN_DISCORD_API + '/oauth2/authorize?' + options);
});

export default router;
