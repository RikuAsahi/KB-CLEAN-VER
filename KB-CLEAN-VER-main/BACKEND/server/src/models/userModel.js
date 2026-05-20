const db = require('../database');

function mapUser(row) {
	if (!row) return null;

	return {
		id: String(row.user_id),
		firstName: row.first_name || '',
		lastName: row.last_name || '',
		fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
		email: row.email,
		passwordHash: row.password_hash,
		role: row.role,
		createdAt: row.date_registered
	};
}

async function createUsersTable() {
	// Schema created via SQL migrations in database/001_init_schema.sql
}


async function findByEmail(email) {
	console.log('[DEBUG] userModel.findByEmail called with:', email);
	const [rows] = await db.query(
		`SELECT user_id, first_name, last_name, email, password_hash, role, date_registered
		 FROM users
		 WHERE LOWER(email) = LOWER(?)
		 LIMIT 1`,
		[email]
	);
	return mapUser(rows[0]);
}

async function findById(id) {
	const [rows] = await db.query(
		`SELECT user_id, first_name, last_name, email, password_hash, role, date_registered
		 FROM users
		 WHERE user_id = ?
		 LIMIT 1`,
		[Number(id)]
	);
	return mapUser(rows[0]);
}

async function createUser({ firstName, lastName, email, passwordHash }) {
	const [result] = await db.query(
		`INSERT INTO users (first_name, last_name, email, password_hash, role)
		 VALUES (?, ?, ?, ?, 'donor')`,
		[String(firstName || '').trim(), String(lastName || '').trim(), String(email || '').toLowerCase(), passwordHash]
	);
	return findById(result.insertId);
}

async function findAll(limit = 50, offset = 0) {
	const [rows] = await db.query(
		`SELECT user_id, first_name, last_name, email, password_hash, role, date_registered
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
