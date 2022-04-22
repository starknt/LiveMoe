module.exports = {
  extends: 'erb',
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-props-no-spreading': 'off',
    'max-classes-per-file': 'off',
    'import/order': 'off',
    'global-require': 'off',
    'promise/always-return': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: require('./.erb/configs/webpack.config.eslint.ts'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
