/**
 * 단일레포 채용과제용 commitlint 설정.
 * MP commitlint.config.mjs 기반. scope는 필수(scope-empty)이되, scope-enum은 프로젝트마다 달라 템플릿엔 없다 —
 * 프로젝트 시작 시 도메인·레이어 기준으로 정해 rules에 추가한다.
 * 예: 'scope-enum': [2, 'always', ['reservation', 'shared', 'api', 'setting']] // 2026-07 mycle(DDD 폴더 기준)
 *
 * [원본] monorepo-playground/commitlint.config.mjs — 원본이 바뀌면 이 파일도 함께 최신화.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'subject-korean': ({subject}) => {
          const hasKorean = /[가-힯]/.test(subject);
          return [hasKorean, 'subject에 한글이 없습니다 — 영어 전용 커밋은 금지입니다 (한글 필수)'];
        },
      },
    },
  ],
  rules: {
    'scope-empty': [2, 'never'],
    'subject-case': [0],
    'subject-korean': [2, 'always'],
    'body-max-line-length': [2, 'always', 200],
  },
};
