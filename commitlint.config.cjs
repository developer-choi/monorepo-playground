module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-korean': ({subject}) => {
          const hasKorean = /[\uAC00-\uD7AF]/.test(subject);
          return [hasKorean, '커밋 메시지(subject)에 한글이 포함되어야 합니다'];
        },
      },
    },
  ],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // apps/
        'examples',
        // packages/
        'design-system',
        'recruitment',
        // project-level
        'setting',
        'best-practice-map',
      ],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [0],
    'subject-korean': [2, 'always'],
  },
};
