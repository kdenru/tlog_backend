module.exports = {
    extends: [
      'standard-with-typescript',
      'prettier'
    ],
    parserOptions: {
      project: './tsconfig.json'
    },
    rules: {
      // свои правила если надо
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/naming-convention': 'off'
    },
    ignorePatterns: ['node_modules', 'dist', 'prisma/generated']
  }