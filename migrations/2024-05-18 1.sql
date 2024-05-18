BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "words" (
	"id"   INTEGER NOT NULL UNIQUE,
	"word" TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "user" (
	"id"               INTEGER NOT NULL UNIQUE,
	"discord_id"       TEXT NOT NULL UNIQUE,
	"name"             TEXT NOT NULL UNIQUE,
	"token_access"     TEXT NOT NULL,
	"token_refresh"    TEXT NOT NULL,
	"token_expires_at" INTEGER NOT NULL, -- Timestamp in milliseconds
	"created_at"       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS "combo" (
	"id"         INTEGER NOT NULL UNIQUE,
	"word_a_id"  INTEGER NOT NULL,
	"word_b_id"  INTEGER NOT NULL,

	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("word_a_id") REFERENCES "words"("id") ON DELETE CASCADE,
	FOREIGN KEY("word_b_id") REFERENCES "words"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "vote" (
	"id"       INTEGER NOT NULL UNIQUE,
	"combo_id" INTEGER NOT NULL,
	"user_id"  INTEGER NOT NULL,
	"score"    INTEGER NOT NULL,

	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("combo_id") REFERENCES "combo"("id") ON DELETE CASCADE,
	FOREIGN KEY("user_id")  REFERENCES "user"("id")  ON DELETE CASCADE
);

COMMIT;
