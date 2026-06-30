/**
 * 단일레포 채용과제용 commitlint 설정.
 * MP commitlint.config.mjs 기반. 모노레포 워크스페이스용 scope-enum/scope-empty는 제거(scope 선택적).
 * 프로젝트 고유 scope를 강제하려면 아래 rules에 scope-enum/scope-empty를 추가한다.
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
    'subject-case': [0],
    'subject-korean': [2, 'always'],
    'body-max-line-length': [2, 'always', 200],
  },
};
