'use strict';

const colors = require('colors'); // eslint-disable-line no-unused-vars

if (process.argv[2] === 'lint') {
	console.log('\n');
	console.log('linting complete. Running tests...'.green);
	console.log('\n');
} else {
	console.log('');
	console.log('Running pre-commit hooks to verify code quality before commit'.green.underline);
	console.log('Hooks:'.green);
	console.log('  1. Lint'.green);
	console.log('  2. Tests'.green);
	console.log('');
}
