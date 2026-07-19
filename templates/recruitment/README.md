# 채용과제 단일레포 셋업 템플릿

채용과제(99% 단일레포)용으로 **미리 평탄화한** static-checking 설정 한 벌이다. MP의 모노레포형 설정을 단일 프로젝트에 그대로 복사·실행할 수 있게 만들어 둔 것으로, `/workflow` PR1마다 모노레포→단일레포로 다시 평탄화하던 비용을 없앤다.

각 룰의 **도입 사유**는 `monorepo-playground/docs/static-checking/{eslint,tsconfig,commitlint}.md`·`docs/formatter.md`에 있다(여기엔 옮기지 않는다).

## 적용 순서 (오버레이)

이 템플릿은 **스캐폴드 위에 덮는** 방식이다. 프레임워크 base(tsconfig의 jsx·moduleResolution, next plugin 등)는 스캐폴드가 만든다.

1. `create-next-app` 또는 `npm create vite`로 프로젝트를 만든다.
2. 아래 **복사 파일**을 프로젝트 루트에 둔다.
3. 아래 **설치 deps**에서 없는 것만 설치한다.
4. **병합 스니펫**(tsconfig / package.json)을 기존 파일에 합친다(통째로 덮지 말 것).
5. `npm run prepare`로 husky를 활성화한다.
6. **뺄·disable 룰** 절을 보고 과제 범위에 안 맞는 룰을 정리한다.

## 복사 파일 (빠짐없이)

**공통 (프레임워크 무관)** — 루트에 그대로:

- `.prettierrc`, `.prettierignore`, `.editorconfig`, `.gitattributes`
- `commitlint.config.mjs`
- `.husky/pre-commit`, `.husky/commit-msg`
- `scripts/check-file-level-disable.sh`

**ESLint (프레임워크별)** — `eslint/`에서 **반드시 2개를 함께** 가져온다:

| 프레임워크 | 가져올 파일                                                       | 둘 위치                                        |
| ---------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Next       | `eslint/eslint.config.base.mjs` + `eslint/eslint.config.next.mjs` | `eslint.config.base.mjs` + `eslint.config.mjs` |
| Vite       | `eslint/eslint.config.base.mjs` + `eslint/eslint.config.vite.mjs` | `eslint.config.base.mjs` + `eslint.config.js`  |

> 프레임워크 config가 `./eslint.config.base.mjs`를 import하므로 **base.mjs를 빼면 `Cannot find module`로 즉시 깨진다.** 항상 base + 프레임워크 config 두 개를 같이 둔다.

## 설치 deps (없는 것만)

```sh
# 공통
npm i -D eslint typescript-eslint eslint-plugin-check-file prettier \
         stylelint stylelint-config-standard-scss \
         @commitlint/cli @commitlint/config-conventional husky lint-staged

# Next (create-next-app이 보통 이미 설치)
npm i -D eslint-config-next

# Vite (create-vite가 일부 설치)
npm i -D eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

## 병합 스니펫 (기존 파일에 합치기)

`tsconfig.json` → `compilerOptions`에 추가(strict 계열 안전망):

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
  },
}
```

`package.json` → `scripts` + `lint-staged` 추가:

```jsonc
{
  "scripts": {
    "lint": "eslint --max-warnings 0",
    "format": "prettier --write .",
    "test-staged": "lint-staged --concurrent false && tsc --noEmit",
    "prepare": "husky",
  },
  "lint-staged": {
    "*.{ts,tsx,js,mjs,cjs,json,css,scss,md}": "prettier --write",
    "**/*.{scss,css}": "stylelint --fix --max-warnings 0",
    "**/*.{ts,tsx}": "eslint --fix --max-warnings 0",
  },
}
```

## 뺄·disable 룰 (과제 범위 점검)

baseRules는 MP의 인프라·컨벤션을 전제하므로, 과제에 따라 정리한다.

- **공통 컴포넌트 전제 룰** — `no-restricted-syntax`의 `<button>`·`<svg>` 직접 사용 금지, 인라인 스타일 객체 금지는 **공통 Button/Icon 컴포넌트가 있다고 가정**한다. 과제에 그게 없으면 바로 걸린다 → (a) 공통 컴포넌트를 만들고 그 안에서만 `eslint-disable` + 사유 주석, 또는 (b) `eslint.config.base.mjs`의 baseRules에서 해당 셀렉터 제거.
- **`custom/filename-export-convention`** — 단일 컴포넌트/훅 파일명 casing 검사. 과제에 과하면 base.mjs에서 이 룰과 동반 팩토리(`createFilenameExportConventionRule`)를 제거.
- **stylelint 계열** — `scripts/check-file-level-disable.sh`, lint-staged의 scss/css 태스크, stylelint deps는 **scss/css를 쓸 때만** 필요. Tailwind 등으로 scss를 안 쓰면 제거 가능.
- **`subject-korean`** — 한글 커밋 메시지 강제. 평가자와 공유하는 레포라 영어 커밋을 허용해야 하면 `commitlint.config.mjs`에서 제거.
- **`scope-empty`(scope 필수)** — scope 강제가 과제 범위에 과하면 `commitlint.config.mjs`에서 `scope-empty`를 제거. 유지한다면 프로젝트 scope-enum을 정해 함께 추가한다(config 헤더 주석의 예시 참고).
