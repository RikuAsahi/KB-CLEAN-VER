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
			branches: 0,
			functions: 1,
			lines: 1,
			statements: 1
		}
	}
};
