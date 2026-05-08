require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const {
	initStore,
	findByEmail,
	findById,
	createLocalUser
} = require('./store/userStore');

const app = express();
const port = Number(process.env.PORT || 4000);

const allowedOrigins = String(process.env.FRONTEND_ORIGINS || '')
	.split(',')
	.map((value) => value.trim())
	.filter(Boolean);

app.use(
	cors({
		origin(origin, callback) {
			if (!origin) return callback(null, true);
			if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}
			return callback(new Error('Origin not allowed by CORS'));
		},
		credentials: true
	})
);

app.use(express.json());
app.use(
	session({
		name: 'kb.sid',
		secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 1000 * 60 * 60 * 24 * 7
		}
	})
);

function toPublicUser(user) {
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		fullName: user.fullName,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt
	};
}

app.get('/health', (_req, res) => {
	res.json({ ok: true, service: 'kapitbisig-auth' });
});

app.post('/auth/signup', async (req, res) => {
	const { firstName, lastName, email, password } = req.body || {};

	if (!firstName || !lastName || !email || !password) {
		return res.status(400).json({ message: 'Missing required fields.' });
	}

	if (String(password).length < 8) {
		return res.status(400).json({ message: 'Password must be at least 8 characters.' });
	}

	try {
		const existing = await findByEmail(String(email).trim());
		if (existing) {
			return res.status(409).json({ message: 'Email already registered.' });
		}

		const passwordHash = await bcrypt.hash(String(password), 10);
		const user = await createLocalUser({
			firstName: String(firstName).trim(),
			lastName: String(lastName).trim(),
			email: String(email).trim(),
			passwordHash
		});

		req.session.userId = user.id;
		return res.status(201).json({ message: 'Account created.', user: toPublicUser(user) });
	} catch (error) {
		if (error && error.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Email already registered.' });
		}
		return res.status(500).json({ message: 'Unable to create account right now.' });
	}
});

app.post('/auth/signin', async (req, res) => {
	const { email, password } = req.body || {};

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required.' });
	}

	try {
		const user = await findByEmail(String(email).trim());
		if (!user || !user.passwordHash) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		const match = await bcrypt.compare(String(password), user.passwordHash);
		if (!match) {
			return res.status(401).json({ message: 'Invalid credentials.' });
		}

		req.session.userId = user.id;
		return res.json({ message: 'Signed in.', user: toPublicUser(user) });
	} catch (_error) {
		return res.status(500).json({ message: 'Unable to sign in right now.' });
	}
});

app.get('/auth/me', async (req, res) => {
	try {
		if (!req.session.userId) {
			return res.status(401).json({ message: 'Not authenticated.' });
		}

		const user = await findById(req.session.userId);
		if (!user) {
			req.session.destroy(() => {});
			return res.status(401).json({ message: 'Not authenticated.' });
		}

		return res.json({ user: toPublicUser(user) });
	} catch (_error) {
		return res.status(500).json({ message: 'Unable to fetch session user.' });
	}
});

app.post('/auth/logout', (req, res) => {
	req.session.destroy(() => {
		res.clearCookie('kb.sid');
		res.json({ message: 'Signed out.' });
	});
});

app.get('/auth/google', (_req, res) => {
	res.status(501).json({ message: 'Google OAuth is not configured yet.' });
});

app.get('/auth/facebook', (_req, res) => {
	res.status(501).json({ message: 'Facebook OAuth is not configured yet.' });
});

async function start() {
	await initStore();
	app.listen(port, () => {
		console.log(`Auth server running on http://localhost:${port}`);
	});
}

start().catch((error) => {
	console.error('Failed to start auth server:', error);
	process.exit(1);
});
