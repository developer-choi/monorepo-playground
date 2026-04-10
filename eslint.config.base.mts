/**
 * TP(test-playground)에서 검증한 공통 ESLint 규칙.
 * 각 워크스페이스의 eslint config에서 import해서 사용.
 */
export const baseRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: {attributes: false}}],
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  curly: ['error', 'all'],
  eqeqeq: ['error', 'always'],
  '@typescript-eslint/no-unnecessary-condition': 'error',
  'no-console': ['error', {allow: ['warn', 'error']}],
  '@typescript-eslint/restrict-template-expressions': ['error', {allowNullish: false}],
  'max-params': ['error', 2],
  'no-restricted-syntax': [
    'error',
    {
      selector: "JSXAttribute[name.name='alt'][value.value='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
    {
      selector: "JSXAttribute[name.name='alt'] > JSXExpressionContainer > Literal[value='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
    {
      selector:
        "JSXAttribute[name.name='alt'] > JSXExpressionContainer > TemplateLiteral[quasis.length=1][quasis.0.value.raw='']",
      message: '빈 alt 금지. 장식용 이미지라면 eslint-disable + 사유 주석을 남기세요.',
    },
  ],
};
