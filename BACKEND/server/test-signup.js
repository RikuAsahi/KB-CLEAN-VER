const db = require('./src/database');
const bcrypt = require('bcryptjs');

async function test() {
  console.log('Testing signup flow...\n');

  try {
    // Step 1: Check database schema
    console.log('Step 1: Checking database users table schema...');
    const [columns] = await db.query('DESCRIBE users');
    const columnNames = columns.map(c => c.Field);
    console.log('Column names:', columnNames);

    if (!columnNames.includes('first_name') || !columnNames.includes('last_name')) {
      console.error('❌ ERROR: Database is missing first_name/last_name columns!');
      process.exit(1);
    }
    console.log('✅ Database schema is correct\n');

    // Step 2: Test direct INSERT
    console.log('Step 2: Testing direct INSERT...');
    const email = `test-${Date.now()}@example.com`;
    const passwordHash = await bcrypt.hash('TestPass123!', 10);

    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES (?, ?, ?, ?, 'donor')`,
      ['Test', 'User', email, passwordHash]
    );
    console.log('✅ Direct INSERT successful, user_id:', result.insertId, '\n');

    // Step 3: Test SELECT
    console.log('Step 3: Testing SELECT with first_name/last_name...');
    const [rows] = await db.query(
      `SELECT user_id, first_name, last_name, email, password_hash, role, date_registered
       FROM users
       WHERE email = ?`,
      [email]
    );
    console.log('✅ SELECT successful:', rows[0] ? rows[0].first_name + ' ' + rows[0].last_name : 'not found', '\n');

    // Step 4: Test userModel
    console.log('Step 4: Testing userModel.createUser...');
    const { createUser } = require('./src/models/userModel');
    const newUser = await createUser({
      firstName: 'Model',
      lastName: 'Test',
      email: `model-${Date.now()}@example.com`,
      passwordHash: await bcrypt.hash('TestPass123!', 10)
    });
    console.log('✅ userModel.createUser successful:', newUser.email, '\n');

    console.log('🎉 All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Message:', error.message);
    console.error('SQL:', error.sql);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();
