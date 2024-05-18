import fs from 'fs';
import { getDatabase, getStatement } from './database.js';
import path from 'path';

export function checkMigrations() {
	// Step 1: Make sure migration table exists, run hard-coded migration.
	migrationsTableExists();

	// Step 2: Get all executed migrations
	const existingMigrations = getMigrations();

	// Step 3: Filter them from the list of all migrations
	const availableMigrations = fs.readdirSync('migrations');
	availableMigrations.sort();

	const requiredMigrations = availableMigrations.filter(m => !existingMigrations.includes(m));

	// Step 4: Run remaining migrations
	requiredMigrations.forEach(migration => {
		console.log('[MIGRATION] Running migration for ' + migration);
		const sql = fs.readFileSync(path.join('migrations', migration), 'utf-8');
		getDatabase().exec(sql);
		insertMigration(migration);
	});
}

function migrationsTableExists() {
	console.log('[MIGRATIONS] Checking migration table exists');
	return getStatement(
		'migrationTableExists',
		`CREATE TABLE IF NOT EXISTS "migrations" (
			"migration_name" TEXT NOT NULL UNIQUE,
			"created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
	).run();
}

function getMigrations() {
	return getStatement('getMigrations', 'SELECT migration_name FROM migrations')
		.all()
		.map(m => m.migration_name);
}

export function insertMigration(migration_name, created_at) {
	const statement = getStatement(
		'insertMigration',
		`INSERT INTO migrations
		(migration_name, created_at)
		VALUES
		($migration_name, $created_at)`,
	);

	return statement.run({
		migration_name,
		created_at: created_at ?? new Date().toISOString(),
	});
}
