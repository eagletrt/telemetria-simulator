const path = require('path');

module.exports = {
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: path.join(__dirname, 'tsconfig.json')
    },
    plugins: ['prettier'],
    extends: [
        '@euberdeveloper/typescript',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    rules: {
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off'
    }
};