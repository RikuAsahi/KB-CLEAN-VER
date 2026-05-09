const db = require('../database');
const { NGO_VERIFICATION_STATUS } = require('../utils/constants');

function mapNgo(row) {
	if (!row) return null;

	return {
		id: String(row.ngo_id),
		userId: String(row.user_id),
		name: row.ngo_name,
		description: row.description,
		websiteUrl: row.website_url,
		phoneNumber: row.phone_number,
		address: row.address,
		registrationNumber: row.registration_number,
		verificationStatus: row.verification_status,
		verifiedAt: row.verified_at,
		logoUrl: row.logo_url,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

async function createNgoProfilesTable() {
	await db.query(`
		CREATE TABLE IF NOT EXISTS ngo_profiles (
			ngo_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL,
			ngo_name VARCHAR(255) NOT NULL,
			description LONGTEXT,
			website_url VARCHAR(255),
			phone_number VARCHAR(20),
			address TEXT,
			registration_number VARCHAR(100) NOT NULL UNIQUE,
			verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
			verified_at DATETIME,
			logo_url VARCHAR(255),
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (ngo_id),
			FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
			UNIQUE KEY uq_registration_number (registration_number),
			INDEX idx_user_id (user_id),
			INDEX idx_verification_status (verification_status)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`);
}

async function findById(id) {
	const [rows] = await db.query(
		`SELECT * FROM ngo_profiles WHERE ngo_id = ? LIMIT 1`,
		[Number(id)]
	);
	return mapNgo(rows[0]);
}

async function findByUserId(userId) {
	const [rows] = await db.query(
		`SELECT * FROM ngo_profiles WHERE user_id = ? LIMIT 1`,
		[Number(userId)]
	);
	return mapNgo(rows[0]);
}

async function findByVerificationStatus(status, limit = 50, offset = 0) {
	const [rows] = await db.query(
		`SELECT * FROM ngo_profiles
		 WHERE verification_status = ?
		 ORDER BY created_at DESC
		 LIMIT ? OFFSET ?`,
		[status, limit, offset]
	);
	return rows.map(mapNgo);
}

async function findAll(limit = 50, offset = 0) {
	const [rows] = await db.query(
		`SELECT * FROM ngo_profiles
		 ORDER BY created_at DESC
		 LIMIT ? OFFSET ?`,
		[limit, offset]
	);
	return rows.map(mapNgo);
}

async function create(data) {
	const [result] = await db.query(
		`INSERT INTO ngo_profiles (user_id, ngo_name, description, website_url, phone_number, address, registration_number)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		[
			Number(data.userId),
			data.name,
			data.description || null,
			data.websiteUrl || null,
			data.phoneNumber || null,
			data.address || null,
			data.registrationNumber
		]
	);
	return findById(result.insertId);
}

async function update(id, data) {
	const updates = [];
	const values = [];

	if (data.name !== undefined) {
		updates.push(`ngo_name = ?`);
		values.push(data.name);
	}
	if (data.description !== undefined) {
		updates.push(`description = ?`);
		values.push(data.description);
	}
	if (data.websiteUrl !== undefined) {
		updates.push(`website_url = ?`);
		values.push(data.websiteUrl);
	}
	if (data.phoneNumber !== undefined) {
		updates.push(`phone_number = ?`);
		values.push(data.phoneNumber);
	}
	if (data.address !== undefined) {
		updates.push(`address = ?`);
		values.push(data.address);
	}
	if (data.logoUrl !== undefined) {
		updates.push(`logo_url = ?`);
		values.push(data.logoUrl);
	}

	if (updates.length === 0) return findById(id);

	values.push(Number(id));
	const sql = `UPDATE ngo_profiles SET ${updates.join(', ')} WHERE ngo_id = ?`;
	await db.query(sql, values);
	return findById(id);
}

async function updateVerificationStatus(id, status) {
	const verifiedAt = status === NGO_VERIFICATION_STATUS.VERIFIED ? new Date() : null;
	await db.query(
		`UPDATE ngo_profiles SET verification_status = ?, verified_at = ? WHERE ngo_id = ?`,
		[status, verifiedAt, Number(id)]
	);
	return findById(id);
}

async function delete_(id) {
	const [result] = await db.query(`DELETE FROM ngo_profiles WHERE ngo_id = ?`, [Number(id)]);
	return result.affectedRows > 0;
}

module.exports = {
	createNgoProfilesTable,
	findById,
	findByUserId,
	findByVerificationStatus,
	findAll,
	create,
	update,
	updateVerificationStatus,
	delete: delete_
};
