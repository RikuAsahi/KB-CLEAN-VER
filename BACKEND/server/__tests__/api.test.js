const { validateEmail, validatePassword, validateAmount } = require('../src/utils/validators');

describe('Validation Tests', () => {
	describe('Email validation', () => {
		it('should reject invalid emails', () => {
			const { validateEmail } = require('../src/utils/validators');

			expect(validateEmail('invalid')).toBe(false);
			expect(validateEmail('user@')).toBe(false);
			expect(validateEmail('user@domain')).toBe(false);
			expect(validateEmail('user@domain.com')).toBe(true);
		});
	});

	describe('Password validation', () => {
		it('should validate password length', () => {
			const { validatePassword } = require('../src/utils/validators');

			expect(validatePassword('short')).toBe(false);
			expect(validatePassword('ValidPass8')).toBe(true);
		});
	});

	describe('Amount validation', () => {
		it('should validate donation amounts', () => {
			const { validateAmount } = require('../src/utils/validators');

			expect(validateAmount(0)).toBe(false);
			expect(validateAmount(-100)).toBe(false);
			expect(validateAmount(100)).toBe(true);
			expect(validateAmount(999999.99)).toBe(true);
		});
	});
});
