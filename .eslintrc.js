module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: 'babel-eslint',
  plugins: ['react'],
  rules: {
    indent: ['off', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 'off',
    'no-debugger': 'off',
    'no-useless-escape': 'warn',
    'no-unused-vars': 'warn',

    'react/jsx-key': 'warn'
  }
};