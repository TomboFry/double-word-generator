import dotenv from 'dotenv';
import { logEntry, rawBody } from '@tombofry/stdlib/src/express/index.js';
import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import formBodyParser from './formParser.js';
import { checkMigrations } from './database/migrations.js';

import routes from './routes/index.js';
import cookieParser from 'cookie-parser';
import { nanoid } from 'nanoid';
import helmet from 'helmet';
import { getDatabase } from './database/database.js';

dotenv.config();

const app = express();
app.use(helmet({
	contentSecurityPolicy: false,
}));
app.use(rawBody);
app.use(cookieParser(nanoid()));
app.use((req, _res, next) => {
	try {
		req.body = JSON.parse(req.rawBody);
	} catch (err) { /* Do nothing */ }
	try {
		if (!req.body) {
			req.body = formBodyParser(req.rawBody);
		}
	} catch (err) { /* do nothing */ console.error(err); }

	next();
});
app.use(logEntry(console.info));

// Set up frontend
app.engine('.hbs', engine({ extname: '.hbs' }));
app.set('views', path.resolve('src/views'));
app.set('view engine', '.hbs');

app.use(express.static('public'));
app.use(routes);

const port = Number(process.env.WORDGEN_SERVER_PORT) || 3000;

process.on('exit', async() => {
	console.info('Exiting - closing database');
	getDatabase().close();
});

app.listen(port, () => {
	checkMigrations();
	console.log(`Listening on ${port}`);
});
