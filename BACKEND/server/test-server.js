const express = require('express');
const { createUser, findByEmail } = require('./src/models/userModel');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

app.post('/test-signup', async (req, res) => {
  try {
    console.log('[TEST] Received signup request');
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      firstName,
      lastName,
      email,
      passwordHash: hash
    });

    res.json({ message: 'Signup successful', user });
  } catch (error) {
    console.error('[TEST] Error:', error.message);
    console.error('[TEST] SQL:', error.sql);
    res.status(500).json({ message: error.message, sql: error.sql });
  }
});

app.listen(4001, () => {
  console.log('✅ Test server running on http://localhost:4001');
});
