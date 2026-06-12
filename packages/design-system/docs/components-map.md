# Components Map

> 이 파일을 수정하기 전에 AC `deploy/contexts/placement.md`(글로벌 분업 정책)를 본다.

design-system이 보유할(또는 보유하지 않을) 컴포넌트의 분류 지도다. "이 UI 요소를 만들 거면 어디에 두는가 / 무엇을 참고하는가"를 한 곳에서 잡는다.

분류는 `apps/examples`의 `@radix-ui/themes` 제거(themes → radix-ui primitives 전환) 과정에서 쓰이던 전 컴포넌트를 부류별로 판정한 결과다. 동일 기준이 채용과제 레포(forworkchoe core) 컴포넌트 이관에도 적용된다.

## 분류 기준

- **design-system**: 다른 레포에서도 재사용할 최하위 시각 프리미티브.
- **examples 유지**: examples 도메인·예제에만 종속(프리미티브를 조합한 래퍼).
- **컴포넌트 없음**: 컴포넌트로 추상화하지 않고 per-file SCSS / typography 스타일로 해결.

## 작성 규칙

각 항목은 `### 컴포넌트명` 헤딩 + 다음 라인으로 구성한다.

- `- 상태: ...` (필수 — `있음` / `신규` / `보완` / `제거`)
- `- 상황: ...` (선택 — 어떤 UI 문제에 쓰는가)
- `- 참고: ...` (선택 — 스펙 백로그·패턴 문서·기존 소스 경로)

## design-system 보유 (재사용 프리미티브)

### Button

- 상태: 있음 / 보완
- 상황: 모든 클릭 액션. 채용과제 레포 버튼들의 일괄 대체 대상.
- 참고: 백로그 `design-system/button.md` (leftIcon/rightIcon, fullWidth, loading 시 preventDefault, 다형성 asChild vs as vs ButtonLink)

### Input (TextField)

- 상태: 있음
- 상황: 한 줄 텍스트 입력.
- 참고: 백로그 `design-system/inputbase-책임-범위.md`(InputBase children 주입 구조 위에 얹음), `design-system/input-기능.md`(type별 가이드·autocomplete/autocapitalize)

### TextArea

- 상태: 신규
- 상황: 여러 줄 텍스트 입력.
- 참고: 백로그 `design-system/inputbase-책임-범위.md`(InputBase 파생)

### Select

- 상태: 신규
- 상황: 드롭다운 단일 선택.
- 참고: 백로그 `design-system/inputbase-책임-범위.md`(InputBase 파생, trailing 화살표 슬롯)

### RadioGroup

- 상태: 신규
- 상황: 배타 선택지 그룹.
- 참고: 백로그 `design-system/checkable-list.md`(체크형 리스트)

### Checkbox

- 상태: 신규
- 상황: 단일 토글 / 다중 선택.
- 참고: 백로그 `design-system/checkable-list.md`

### Badge

- 상태: 신규
- 상황: 상태·카테고리를 나타내는 작은 알약 라벨(OK/FAIL, 분류 태그 등).

### Card

- 상태: 신규
- 상황: 테두리+그림자 컨테이너 박스.

### Callout

- 상태: 신규
- 상황: 아이콘 달린 info/warning 안내문 박스.

### Separator

- 상태: 신규
- 상황: 구역을 나누는 구분선.

### Table

- 상태: 신규
- 상황: 표(Root/Header/Row/Cell 구조).

### Modal 모달류 (Alert / Confirm / Form)

- 상태: `Alert`·`Confirm` 구현됨 (DS `Dialog`+`Button` 조합) / Form(폼+제출/취소)은 미구현(향후)
- 상황: Alert(확인 1버튼, void) / `Confirm`(취소·확인 2버튼, `overlay.openAsync`로 boolean await). 둘 다 controlled(`open`+콜백)이며 overlay-kit 제어는 소비자가 한다. themes `AlertDialog` 실사용처(에러 통지=Alert, 게시판 삭제 확인=Confirm) 모두 교체 완료.
- 참고: `src/components/Modal/Alert.tsx`, `src/components/Modal/Confirm.tsx`, 호출 패턴은 `apps/examples/docs/patterns/overlay/OverlayKitModal.md`

## 컴포넌트 없음

### 타이포그래피 (Heading / Text / Link)

- 상태: 컴포넌트 없음 — typography 스타일로 대체
- 상황: "결국 텍스트"라 styled 컴포넌트로 추상화하지 않는다. DS `src/styles/typography.module.scss` 클래스 + plain 태그(`<h_>`/`<p>`/`<a>`)로 작성.
- 참고: Link의 시각 스타일만 typography. 내부/외부 라우팅 분기(next/link vs `<a>`) 동작은 별개 → 백로그 `design-system/link-or-anchor.md`

### 레이아웃 (Box / Flex / Grid / Container)

- 상태: 컴포넌트 없음 — per-file SCSS로 대체
- 상황: 자리잡기 CSS 한두 줄을 prop으로 감싼 styled div라 추상화 가치 낮음. 페이지·컴포넌트마다 `*.module.scss`에서 직접 정의하고, 자리잡기 값도 `var(--spacing-*)` 토큰 사용.
- 참고: 백로그 `radix-themes-removal/layout-no-component.md`(themes → plain 변환표)

## examples 유지 (도메인·예제 종속)

design-system 프리미티브를 조합해 만든 examples 전용 래퍼는 DS로 올리지 않고 examples에 남긴다.

- **인라인 Code**: 회색 배경 인라인 `<code>` 한 줄(sandbox/zod/partial 4곳). 기능 거의 없음 → examples 자체 구현(typography + 배경).
- **LinkCardGrid**: top page 카드(Card + Badge 조합).
- **ExampleHeader**: 예제 페이지 상단 헤더.
- **Board\***: Card/Form/Table/Detail/Filter/ListPage/Skeleton/TagInput — Card/Table/Badge/Separator/Confirm 조합 게시판 도메인.
- **demos**: BadExample/GoodExample/AutoFocusDemo/ErrorScrollDemo/SubmitButtonDemo/ValidationModeDemo — Card/Callout/Badge 조합.
- **search**: SearchForm/SearchResults/Highlight/ErrorFallback.
- **인프라**: Header/Sidebar, AppProvider/HandledErrorBoundary, ErrorPageTemplate, OptimizedImage/BaseImage.

## 범위 밖

### 코드블록 (Shiki)

- 상태: 이미 자체 구현 — 변경 없음
- 상황: `/form/trim`·`/form/error-feedback`·`/form/auto-focus`에서 `shiki`의 `codeToHtml(code, {lang, theme})` 직접 호출. themes와 무관. 출력은 `.shiki` 클래스로 `apps/examples/src/shared/global.css`에서 스타일링.
- 참고: my-else/blog도 같은 Shiki 엔진을 `rehype-pretty-code`로 감싸 사용(MDX 파이프라인). MP는 페이지 내 문자열 상수를 직접 변환.
