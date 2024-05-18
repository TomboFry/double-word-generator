import { getStatement } from './database.js';

export function generateCombo(user_id) {
	// Sometimes, return a combo that already exists. This will help get
	// multiple votes on existing combos. However, we don't want to show a
	// combo the user has already seen, and if there are none left, we need
	// to safely continue from this if-statement.
	if (Math.random() < 0.5) {
		const existingCombo = getRandomCombo(user_id);
		if (existingCombo) return existingCombo;
	}

	// Generate a new combo

	const [ word_a, word_b ] = getWordCombo();
	const existingCombo = getComboExists(word_a.id, word_b.id);

	const result = {
		combo_id: existingCombo,
		word_a: word_a.word,
		word_b: word_b.word,
	};

	if (!existingCombo) {
		const combo_id = insertCombo(word_a.id, word_b.id);
		result.combo_id = combo_id;
	}

	return result;
}

function getWordCombo() {
	return getStatement(
		'getWordCombo',
		'SELECT * FROM words ORDER BY RANDOM() LIMIT 2',
	).all();
}

function getRandomCombo(user_id) {
	return getStatement(
		'getRandomCombo',
		`SELECT DISTINCT c.id AS combo_id, wa.word AS word_a, wb.word AS word_b, SUM(v.score) AS score FROM combo c
			INNER JOIN words wa ON word_a_id = wa.id
			INNER JOIN words wb ON word_b_id = wb.id
			LEFT JOIN vote v ON c.id = v.combo_id
		WHERE NOT EXISTS (
			SELECT DISTINCT vote.combo_id FROM vote
			WHERE c.id = vote.combo_id AND vote.user_id = $user_id
		) AND (score > -4 OR score IS NULL)
		GROUP BY c.id
		ORDER BY RANDOM() LIMIT 1`,
	).get({ user_id });
}

/**
 * @param  {number} word_a_id
 * @param  {number} word_b_id
 * @return {number?}
 */
function getComboExists(word_a_id, word_b_id) {
	const statement = getStatement(
		'getComboExists',
		`SELECT id FROM combo
		WHERE word_a_id = $word_a_id
		AND word_b_id = $word_b_id
		LIMIT 1`,
	);

	return statement.get({ word_a_id, word_b_id })?.id;
}

/**
 * @param   {number} word_a_id
 * @param   {number} word_b_id
 * @returns {number}
 */
function insertCombo(word_a_id, word_b_id) {
	const statement = getStatement(
		'insertCombo',
		`INSERT INTO combo
		(word_a_id, word_b_id)
		VALUES
		($word_a_id, $word_b_id)`,
	);

	return statement.run({ word_a_id, word_b_id }).lastInsertRowid;
}

export function insertVote(combo_id, user_id, score) {
	return getStatement(
		'insertVote',
		'INSERT INTO vote (combo_id, user_id, score) VALUES ($combo_id, $user_id, $score)',
	).run({ combo_id, user_id, score });
}

export function getUserFavouriteWords(user_id) {
	return getStatement(
		'getUserFavouriteWords',
		`SELECT wa.word AS word_a, wb.word AS word_b FROM vote
		INNER JOIN combo AS c ON c.id = vote.combo_id
		INNER JOIN words AS wa ON word_a_id = wa.id
		INNER JOIN words AS wb ON word_b_id = wb.id
		WHERE user_id = $user_id AND score > 0
		ORDER BY score DESC`,
	).all({ user_id });
}
