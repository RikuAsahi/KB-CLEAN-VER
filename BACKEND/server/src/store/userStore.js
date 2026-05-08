const mysql = require('mysql2/promise');

let pool;

async function getPool() {
	if (!pool) {
		pool = mysql.createPool({
			host: process.env.DB_HOST || '127.0.0.1',
			port: Number(process.env.DB_PORT || 3306),
			user: process.env.DB_USER || 'root',
			password: process.env.DB_PASSWORD || '',
			database: process.env.DB_NAME || 'kapitbisig_db',
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0
		});
	}
	return pool;
}

function mapUser(row) {
	if (!row) return null;

	const nameParts = String(row.full_name || '').trim().split(/\s+/).filter(Boolean);
	const firstName = nameParts[0] || '';
	const lastName = nameParts.slice(1).join(' ');

	return {
		id: String(row.user_id),
		firstName,
		lastName,
		fullName: row.full_name,
		email: row.email,
		passwordHash: row.password_hash,
		role: row.role,
		createdAt: row.date_registered
	};
}

async function initStore() {
	const db = await getPool();
	await db.query(`
		CREATE TABLE IF NOT EXISTS users (
			user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			full_name VARCHAR(150) NOT NULL,
			email VARCHAR(190) NOT NULL,
			password_hash VARCHAR(255) NULL,
			role ENUM('donor', 'ngo_admin', 'admin', 'superadmin') NOT NULL DEFAULT 'donor',
			date_registered DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id),
			UNIQUE KEY uq_users_email (email)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);
}

async function findByEmail(email) {
	const db = await getPool();
	const [rows] = await db.query(
		`SELECT user_id, full_name, email, password_hash, role, date_registered
		 FROM users
		 WHERE LOWER(email) = LOWER(?)
		 LIMIT 1`,
		[email]
	);
	return mapUser(rows[0]);
}

async function findById(id) {
	const db = await getPool();
	const [rows] = await db.query(
		`SELECT user_id, full_name, email, password_hash, role, date_registered
		 FROM users
		 WHERE user_id = ?
		 LIMIT 1`,
		[Number(id)]
	);
	return mapUser(rows[0]);
}

async function createLocalUser({ firstName, lastName, email, passwordHash }) {
	const db = await getPool();
	const fullName = `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();

	const [result] = await db.query(
		`INSERT INTO users (full_name, email, password_hash, role)
		 VALUES (?, ?, ?, 'donor')`,
		[fullName, String(email || '').toLowerCase(), passwordHash]
	);

	return findById(result.insertId);
}

module.exports = {
	initStore,
	findByEmail,
	findById,
	createLocalUser
};
