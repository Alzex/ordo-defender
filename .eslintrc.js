module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        "singleQuote": true,
        "trailingComma": "all"
      },
    ],
  },
};