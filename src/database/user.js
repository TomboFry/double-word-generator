import { getStatement } from './database.js';

export function insertUser(name, discord_id, token_access, token_refresh, token_expires_at) {
	const statement = getStatement(
		'insertUser',
		`INSERT INTO user
		(name, discord_id, token_access, token_refresh, token_expires_at)
		VALUES
		($name, $discord_id, $token_access, $token_refresh, $token_expires_at)`,
	);

	return statement.run({
		name,
		discord_id,
		token_access,
		token_refresh,
		token_expires_at,
	});
}

export function checkUserExists(id, discord_id, name) {
	const statement = getStatement(
		'checkUserExists',
		`SELECT id, discord_id, name FROM user
		WHERE id LIKE $id AND discord_id LIKE $discord_id AND name LIKE $name
		LIMIT 1`,
	);

	if (!id && !name && !discord_id) {
		return null;
	}

	return statement.get({
		id: id ?? '%',
		discord_id: discord_id ?? '%',
		name: name ?? '%',
	});
}

export function getUserFromToken(token_access) {
	const statement = getStatement(
		'getUserFromToken',
		`SELECT id, name, token_refresh
		FROM user
		WHERE token_access = $token_access
		LIMIT 1`,
	);

	return statement.get({ token_access });
}

export function updateUser(id, name, token_access, token_refresh, token_expires_at) {
	const statement = getStatement(
		'updateUser',
		`UPDATE user
		SET name = $name,
		    token_access = $token_access,
		    token_refresh = $token_refresh,
		    token_expires_at = $token_expires_at
		WHERE id = $id`,
	);

	return statement.run({
		id,
		name,
		token_access,
		token_refresh,
		token_expires_at,
	});
}
