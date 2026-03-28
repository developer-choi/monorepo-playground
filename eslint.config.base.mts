/**
 * TP(test-playground)에서 검증한 공통 ESLint 규칙.
 * 각 워크스페이스의 eslint config에서 import해서 사용.
 */
export const baseRules = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
  }],
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  'eqeqeq': ['error', 'always'],
  '@typescript-eslint/no-unnecessary-condition': 'error',
  'no-console': ['error', { allow: ['warn', 'error'] }],
  '@typescript-eslint/restrict-template-expressions': ['error', { allowNullish: false }],
  'max-params': ['error', 2],
};
