import phin from 'phin';
import { getUserFromToken, updateUser } from '../database/user.js';

export async function generateAccessToken(code) {
	// Make request to token endpoint
	const form = {
		grant_type: 'authorization_code',
		code,
		redirect_uri: process.env.WORDGEN_DISCORD_REDIRECT_URI + '/login/callback',
	};

	const basicAuth = Buffer
		.from(`${process.env.WORDGEN_DISCORD_CLIENT_ID}:${process.env.WORDGEN_DISCORD_CLIENT_SECRET}`)
		.toString('base64');

	const { body } = await phin({
		url: process.env.WORDGEN_DISCORD_API + '/oauth2/token',
		method: 'POST',
		parse: 'json',
		headers: {
			Authorization: 'Basic ' + basicAuth,
		},
		form,
	});

	return body;
}
export async function generateRefreshToken(refresh_token) {
	// Make request to token endpoint
	const form = {
		grant_type: 'refresh_token',
		refresh_token,
	};

	const basicAuth = Buffer
		.from(`${process.env.WORDGEN_DISCORD_CLIENT_ID}:${process.env.WORDGEN_DISCORD_CLIENT_SECRET}`)
		.toString('base64');

	const { body } = await phin({
		url: process.env.WORDGEN_DISCORD_API + '/oauth2/token',
		parse: 'json',
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + basicAuth,
		},
		form,
	});

	return body;
}

export async function getUserIdentity(access_token) {
	const { body } = await phin({
		url: process.env.WORDGEN_DISCORD_API + '/users/@me',
		parse: 'json',
		headers: {
			'Authorization': 'Bearer ' + access_token,
		},
		method: 'GET',
	});
	return body;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authRequiredMiddleware(req, res, next) {
	try {
		const {
			wordgen_oauth_token: access_token,
			wordgen_oauth_expires_at: expires_at,
		} = req.cookies;

		// Cookies must be present
		if (!access_token || !expires_at) {
			throw new Error('No access token provided');
		}

		// Token must exist in database
		const user = getUserFromToken(access_token);
		if (!user) {
			throw new Error('Token does not exist in the database');
		}

		// Token must be within date range
		if (Date.now() > expires_at) {
			const newTokens = await generateRefreshToken(user.token_refresh);
			updateUser(
				user.id,
				user.name,
				newTokens.access_token,
				newTokens.refresh_token,
				Date.now() + (newTokens.expires_in * 1000),
			);
		}

		req.user_id = user.id;
		req.user_name = user.name;

		next();
	} catch (err) {
		console.error(err);
		res.redirect('/new');
		return;
	}
}
