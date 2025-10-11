import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { auth } from './routes/auth.js';
import { post } from './routes/post.js';
import OpenAI from 'openai';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const config = {
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	redirect_uri: process.env.REDIRECT_URI,
	port: process.env.PORT || 3000,
};

const app = express();

app.use(express.json());

app.get('/', (_, res) => {
	res.send('Hello from Snap2Sell!');
});

/**
 * Routes
 */
[auth, post].forEach((route) => route(app, config));

app.listen(config.port, () => {
	console.log(`🚀 Server ready at http://localhost:${config.port}`);
});

export default app;
