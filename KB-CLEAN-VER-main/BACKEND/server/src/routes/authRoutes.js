const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);

router.get('/google', (req, res) => {
	res.status(501).json({ message: 'Google OAuth is not configured yet.' });
});

router.get('/facebook', (req, res) => {
	res.status(501).json({ message: 'Facebook OAuth is not configured yet.' });
});

module.exports = router;
