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
  '@typescript-eslint/naming-convention': [
    'error',
    {selector: 'default', format: ['camelCase']},
    {selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase']},
    {selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow'},
    {selector: 'function', format: ['camelCase', 'PascalCase']},
    {selector: 'typeLike', format: ['PascalCase']},
    {selector: 'property', format: ['camelCase', 'UPPER_CASE']},
    {selector: 'method', format: ['camelCase']},
    {selector: 'import', format: null},
    {selector: 'variable', modifiers: ['destructured'], format: null},
  ],
  'no-magic-numbers': [
    'error',
    {
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      enforceConst: true,
    },
  ],
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
    {
      selector: 'TSEnumDeclaration',
      message: 'enum 대신 as const 객체를 사용하세요.',
    },
    {
      selector: "JSXOpeningElement[name.name='button']",
      message: '<button> 직접 사용 금지. 공통 Button 컴포넌트를 사용하세요.',
    },
    {
      selector: "JSXAttribute[name.name='style']",
      message:
        '인라인 스타일 금지. CSS Modules를 사용하세요. 예외: 동적 값·CSS 변수 주입·스켈레톤. 이 외의 경우 사용자에게 허락을 구하세요. — eslint-disable + 사유 주석으로 처리.',
    },
    {
      selector: "JSXElement > JSXOpeningElement[name.name='svg']",
      message: 'SVG 직접 작성 금지. 아이콘 컴포넌트나 SVG 파일로 분리하세요.',
    },
  ],
};
