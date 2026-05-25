# T21. TP에서 yalc로 design-system Dialog를 overlay-kit으로 띄우는 데모

## 개요

TP(test-playground)에서 MP design-system의 Dialog를 overlay-kit imperative 호출 패턴으로 띄우는 데모 페이지 작성.

## 현재 상황 (작업 진행 중, TP commit 미진행)

- design-system 작업 완료 (radix Dialog wrapper + Compound 패턴 + master commits)
- yalc global install 완료 (`npm install -g yalc`)
- design-system yalc publish 완료
- TP에 yalc add 완료 (`@monorepo-playground/design-system` 의존성)
- TP에 overlay-kit yarn add 완료
- TP `layout.tsx`에 `OverlayProvider` 추가 + design-system `style.css` import 완료
- TP `dialog-demo` 페이지 생성 완료
- **TP 변경 commit 미진행** (별개 repo, 시각 확인 후 commit 결정)

## 남은 작업

1. 사용자가 TP `yarn dev` 띄워서 시각 확인
   - URL: `http://localhost:3000/dialog-demo`
   - "Dialog 열기" 버튼 → overlay-kit이 Dialog 띄우는 동작 확인
2. 시각 OK이면 TP commit 진행:
   - `package.json` + `yarn.lock` (overlay-kit + @monorepo-playground/design-system `file:.yalc/...`)
   - `src/app/layout.tsx` (OverlayProvider + style.css import)
   - `src/app/dialog-demo/page.tsx` (신규)
3. `.yalc/` 폴더 gitignore 검토 (yalc 메타데이터 — 보통 gitignore 권장)

## 관련 파일 (TP)

- `~/WebstormProjects/main/test-playground/src/app/layout.tsx`
- `~/WebstormProjects/main/test-playground/src/app/dialog-demo/page.tsx`
- `~/WebstormProjects/main/test-playground/package.json`
- `~/WebstormProjects/main/test-playground/yarn.lock`
- `~/WebstormProjects/main/test-playground/.gitignore`

## 미정 항목

- TP commit 분할 (overlay-kit 설치 / layout 변경 / demo page 신규 — 따로 vs 통합)
- design-system update 시 yalc push 자동화 (현재 수동 — `cd packages/design-system && npm run build && yalc push`)
- `.yalc/` 디렉토리 gitignore 패턴 (`/.yalc`, `yalc.lock` 표준)
- demo page에 추가 컴포넌트 (Button 등) 적용 검토
