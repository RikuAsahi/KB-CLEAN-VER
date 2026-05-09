const bcrypt = require('bcryptjs');
const { findByEmail, findById, createUser } = require('../models/userModel');
const { validateEmail, validatePassword } = require('../utils/validators');
const constants = require('../utils/constants');

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

async function signup(req, res, next) {
	try {
		const { firstName, lastName, email, password } = req.body || {};

		if (!firstName || !lastName || !email || !password) {
			return res.status(400).json({ message: 'Missing required fields.' });
		}

		if (!validateEmail(email)) {
			return res.status(400).json({ message: 'Invalid email format.' });
		}

		if (!validatePassword(password)) {
			return res.status(400).json({ message: 'Password must be at least 8 characters.' });
		}

		const existing = await findByEmail(String(email).trim());
		if (existing) {
			return res.status(409).json({ message: 'Email already registered.' });
		}

		const passwordHash = await bcrypt.hash(String(password), 10);
		const user = await createUser({
			firstName: String(firstName).trim(),
			lastName: String(lastName).trim(),
			email: String(email).trim(),
			passwordHash
		});

		req.session.userId = user.id;
		return res.status(201).json({ message: 'Account created.', user: toPublicUser(user) });
	} catch (error) {
		next(error);
	}
}

async function signin(req, res, next) {
	try {
		const { email, password } = req.body || {};

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required.' });
		}

		const user = await findByEmail(String(email).trim());
		if (!user || !user.passwordHash) {
			return res.status(401).json({ message: constants.ERROR_MESSAGES.INVALID_CREDENTIALS });
		}

		const match = await bcrypt.compare(String(password), user.passwordHash);
		if (!match) {
			return res.status(401).json({ message: constants.ERROR_MESSAGES.INVALID_CREDENTIALS });
		}

		req.session.userId = user.id;
		return res.json({ message: 'Signed in.', user: toPublicUser(user) });
	} catch (error) {
		next(error);
	}
}

async function getMe(req, res, next) {
	try {
		if (!req.session.userId) {
			return res.status(401).json({ message: constants.ERROR_MESSAGES.NOT_AUTHENTICATED });
		}

		const user = await findById(req.session.userId);
		if (!user) {
			req.session.destroy(() => {});
			return res.status(401).json({ message: constants.ERROR_MESSAGES.NOT_AUTHENTICATED });
		}

		return res.json({ user: toPublicUser(user) });
	} catch (error) {
		next(error);
	}
}

function logout(req, res) {
	req.session.destroy(() => {
		res.clearCookie('kb.sid');
		res.json({ message: 'Signed out.' });
	});
}

module.exports = {
	signup,
	signin,
	getMe,
	logout
};
