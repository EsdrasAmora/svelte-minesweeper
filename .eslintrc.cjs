module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		},
		{
			rules: {
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
						ignoreRestSiblings: true
					}
				]
			}
		}
	]
};

module.exports = {
	root: true,
	overrides: [
		{
			files: ['*.ts', '*.js'],
			parser: '@typescript-eslint/parser', // Specifies the ESLint parser
			plugins: ['@typescript-eslint', 'prettier'],
			extends: [
				'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
				'prettier',
				'plugin:prettier/recommended'
			],
			parserOptions: {
				ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
				sourceType: 'module', // Allows for the use of imports
				tsconfigRootDir: __dirname,
				project: ['./tsconfig.json']
			},
			rules: {
				'prettier/prettier': [
					'error',
					{
						endOfLine: 'auto'
					}
				],
				'func-call-spacing': 'off',
				'block-scoped-var': 'error',
				'array-bracket-spacing': ['error', 'never'],
				curly: ['error', 'all'],
				'@typescript-eslint/no-namespace': 'off',
				'@typescript-eslint/require-await': 'off',
				'@typescript-eslint/no-unnecessary-type-assertion': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/restrict-plus-operands': 'off',
				'@typescript-eslint/no-empty-function': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/await-thenable': 'off',
				'@typescript-eslint/no-use-before-define': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-empty-interface': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/no-floating-promises': 'off',
				'@typescript-eslint/restrict-template-expressions': 'off',
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'@typescript-eslint/member-delimiter-style': [
					'error',
					{
						singleline: {
							requireLast: false
						}
					}
				]
			}
		},
		{
			files: ['*.graphql'],
			parser: '@graphql-eslint/eslint-plugin',
			plugins: ['@graphql-eslint', 'prettier'],
			extends: ['prettier', 'plugin:prettier/recommended']
		}
	]
};
