module.exports = {
  extends: ['@commitlint/config-conventional'],
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
      ],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [0],
  },
};
