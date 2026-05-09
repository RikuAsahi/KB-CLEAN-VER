const db = require('../database');

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

async function createUsersTable() {
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
	const [rows] = await db.query(
		`SELECT user_id, full_name, email, password_hash, role, date_registered
		 FROM users
		 WHERE user_id = ?
		 LIMIT 1`,
		[Number(id)]
	);
	return mapUser(rows[0]);
}

async function createUser({ firstName, lastName, email, passwordHash }) {
	const fullName = `${String(firstName || '').trim()} ${String(lastName || '').trim()}`.trim();
	const [result] = await db.query(
		`INSERT INTO users (full_name, email, password_hash, role)
		 VALUES (?, ?, ?, 'donor')`,
		[fullName, String(email || '').toLowerCase(), passwordHash]
	);
	return findById(result.insertId);
}

async function findAll(limit = 50, offset = 0) {
	const [rows] = await db.query(
		`SELECT user_id, full_name, email, password_hash, role, date_registered
		 FROM users
		 ORDER BY date_registered DESC
		 LIMIT ? OFFSET ?`,
		[limit, offset]
	);
	return rows.map(mapUser);
}

async function updateRole(id, newRole) {
	await db.query(
		`UPDATE users SET role = ? WHERE user_id = ?`,
		[newRole, Number(id)]
	);
	return findById(id);
}

async function delete_(id) {
	const [result] = await db.query(`DELETE FROM users WHERE user_id = ?`, [Number(id)]);
	return result.affectedRows > 0;
}

module.exports = {
	createUsersTable,
	findByEmail,
	findById,
	findAll,
	createUser,
	updateRole,
	delete: delete_
};
