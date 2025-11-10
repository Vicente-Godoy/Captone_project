module.exports = {
  env: {
    commonjs: true,
    es2022: true,
    node: true,
    mocha: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs'
  },
  rules: {
    'no-console': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'padded-blocks': 'off',
    'no-multiple-empty-lines': ['warn', { max: 2 }],
    'space-before-function-paren': 'off',
    'keyword-spacing': ['warn', { before: true, after: true }],
    'no-trailing-spaces': 'off',
    'object-shorthand': 'off',
    'import/no-dynamic-require': 'off',
    'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
    'no-const-assign': 'error'
  }
};

