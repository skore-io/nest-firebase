module.exports = {
  extends: ['airbnb-typescript/base'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',
    '@typescript-eslint/semi': 'off',
    'class-methods-use-this': 'off',
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-console': ['off'],
  },
}
