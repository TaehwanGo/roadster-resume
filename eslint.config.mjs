import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';

/** React Compiler를 쓰지 않으므로 react-hooks recommended의 컴파일러 진단 규칙은 끈다. */
const reactCompilerRulesOff = Object.fromEntries(
  [
    'static-components',
    'use-memo',
    'preserve-manual-memoization',
    'incompatible-library',
    'immutability',
    'globals',
    'refs',
    'set-state-in-effect',
    'error-boundaries',
    'purity',
    'set-state-in-render',
    'unsupported-syntax',
    'config',
    'gating',
  ].map((rule) => [`react-hooks/${rule}`, 'off']),
);

export default defineConfig([
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  prettierRecommended,
  {
    rules: {
      ...reactCompilerRulesOff,
      'no-console': 'off',
      'prettier/prettier': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  { linterOptions: { reportUnusedDisableDirectives: 'off' } },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
