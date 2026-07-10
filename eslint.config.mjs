import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/', 'node_modules/', 'src/types-config-ti.ts'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      'no-else-return': 'off',
      'no-underscore-dangle': 'off',
      curly: 'off',
      'no-return-assign': 'off',
      'consistent-return': 'off',
      'no-mixed-operators': 'off',
      'class-methods-use-this': 'off',
      'no-nested-ternary': 'off',
      camelcase: 'off',
    },
  },
]);
