module.exports = {
	testEnvironment: 'node',
	coveragePathIgnorePatterns: ['/node_modules/'],
	testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/server.js',
		'!src/config.js'
	],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50
		}
	}
};
