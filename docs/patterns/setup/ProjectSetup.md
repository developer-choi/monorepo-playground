# Project Setup (PR1)

## 상황

채용과제·사이드 프로젝트의 초기 세팅. 정적 분석·포맷·커밋 훅은 단일레포용으로 미리 평탄화한 `templates/recruitment/`를 복사해 적용한다.

## 정적 분석·포맷·커밋 훅 — 템플릿 복사

ESLint·tsconfig·Prettier·EditorConfig·gitattributes·commitlint·husky·lint-staged는 루트 [`templates/recruitment/`](../../../templates/recruitment/)를 복사해 셋업한다. 복사할 파일, 설치 deps, 병합 스니펫(tsconfig·package.json), 과제 범위상 뺄 룰은 [`templates/recruitment/README.md`](../../../templates/recruitment/README.md)를 따른다.

각 룰의 도입 사유는 `docs/static-checking/{eslint,tsconfig,commitlint}.md`·`docs/formatter.md`를 참조한다.

## .gitignore 필수 항목

```gitignore
.claude/
```

AI 에이전트의 작업 계획 파일(`plan/`)과 로컬 설정(`.claude/`)이 레포에 커밋되지 않도록 프로젝트 생성 직후 `.gitignore`에 추가한다.

## 패키지매니저 강제

프로젝트가 사용하는 패키지매니저 외의 도구(npm/yarn/pnpm)로 install을 시도하면 차단되도록 설정한다.

```jsonc
// package.json
{
  "scripts": {
    "preinstall": "npx only-allow npm", // MP 실제값. 인자는 그 프로젝트의 패키지매니저 (pnpm 프로젝트면 pnpm)
  },
}
```

- preinstall 스크립트는 어떤 패키지매니저로 install을 시도하든 먼저 실행되므로, corepack 활성화 여부와 무관하게 차단된다.
- `packageManager` 필드가 있으면 pnpm/yarn은 자체적으로도 차단하지만, `only-allow`는 `packageManager` 필드가 없는 환경에서도 동작하는 추가 안전장치다.

## reset.css / 기본 폰트

| 항목                | 문서                                     |
| ------------------- | ---------------------------------------- |
| reset.css           | `docs/patterns/setup/ResetCss.md`        |
| 기본 폰트 (Next.js) | `docs/patterns/setup/NextRootLayout.md`  |
