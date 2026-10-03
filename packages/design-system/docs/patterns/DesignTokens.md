# 디자인 토큰

> 적용 범위: `packages/design-system` 내부. 다른 패키지는 적용 대상이 아니다.

## 목적

**테마를 바꿀 때 여기만 바꾸면 된다.**

색·여백·폰트를 raw 리터럴로 박으면 톤을 바꿀 때 전 코드를 grep해야 한다. 토큰으로 추상화하면 토큰 정의 한 곳만 바꿔 전 영역에 반영된다. 이 디자인 시스템은 **마크업은 공유, 시각 스타일은 채용과제별로 교체**가 목표라 일괄 교체가 핵심이다.

## 출처

토큰의 회색조 톤은 [my-else/blog의 globals.scss](https://github.com/developer-choi/blog/blob/master/src/app/globals.scss)에서 가져왔지만, **이 레포가 캐논**이다. 명명·구성은 이 문서의 정책을 따른다 (blog는 톤 레퍼런스).

## 컬러 명명 원칙

### 최상위 분류는 fg / bg / primary 세 개

색 토큰은 먼저 아래 세 분류 중 하나에 속한다. 셋은 같은 층의 분류다.

- **fg** (foreground) — 전경. 텍스트·아이콘·**보더**(보더도 윤곽 그리는 전경 역할).
- **bg** (background) — 배경. 표면(카드·모달·시트), 페이지 배경.
- **primary** — 브랜드 컬러. 브랜드 컬러는 배경용·글자용으로 나뉘지 않으므로 fg / bg 아래에 두지 않는다.

text / border / surface / icon 같은 분류를 늘리면 같은 톤의 색이 카테고리별로 흩어져 테마 교체 시 일괄성이 깨진다. 세 분류로 묶어두면 같은 톤 색이 하나의 토큰 아래 모인다.

Material Design 3도 색을 역할 묶음으로 나누고, 브랜드(primary)를 바탕(surface)과 같은 층의 묶음으로 둔다.

출처: https://m3.material.io/styles/color/roles
> There are 26 standard color roles organized into six groups: primary, secondary, tertiary, error, surface, and outline

### 상태가 아니라 시각 단계·역할

상태(hover, focus, active, disabled)를 토큰 이름에 박지 않는다. 같은 톤이 필요한 모든 곳에 재사용될 수 있도록 **단계** 또는 **의미적 역할**로 명명한다.

**위반**

```css
--color-bg-hover: #f5f5f5;       /* hover에서만 → 다른 옅은 배경과 묶이지 않음 */
--color-fg-focus: #1a1a1a;       /* focus에서만 → 다른 액센트 영역과 묶이지 않음 */
```

결과적으로 textHover, borderActive, bgDisabled 식으로 상태×속성 조합이 무한 증식하고, 톤 교체 시 같은 톤 색을 따로따로 갱신해야 함 → 토큰의 목적 상실.

**올바른 방식**

```css
--color-bg-subtle: #f5f5f5;   /* hover, 카드, 강조 박스 등 공유 */
--color-primary: #1a1a1a;     /* focus 보더, 액센트 텍스트 등 공유 */
```

호버 상태는 컴포넌트가 적절한 토큰을 골라 쓴다.

```scss
.menuItem:hover {
  background-color: var(--color-bg-subtle);
}
```

브랜드 컬러처럼 쓰는 쪽이 덮어쓰는 색에 hover·눌림 색을 넣을 때는 토큰을 따로 두지 않고 컴포넌트 안에서 계산한다. 그래야 쓰는 쪽이 `--color-primary` 하나만 덮어도 hover·눌림 색이 따라온다.

```scss
.primaryButton:hover {
  background-color: color-mix(in srgb, var(--color-primary) 88%, black);
}
```

> 이 "상태 박힘 금지"는 **컬러에 한정**한다. spacing·font·radius·shadow는 상태별로 분기될 일이 거의 없어 동일 원칙을 강제하지 않는다.

### 파생 단어

각 분류 안에서 의미 단어로 파생한다. fg / bg는 아래 단계로 파생한다.

| suffix | 의미 |
|---|---|
| `default` | 기본 (텍스트의 가장 진한 색, 배경의 흰색 등) |
| `secondary` | 보조 단계 (fg) |
| `subtle` | 약한 단계 (bg: hover·카드 배경, fg: 가는 보더·디바이더) |
| `muted` | 흐릿한 단계 (bg: 선택 상태·info 박스, fg: placeholder·disabled 텍스트) |
| `destructive` | 돌이킬 수 없는 위험·삭제 액션 |
| `success` | 성공·완료 상태 (긍정 피드백) |

primary 분류는 브랜드 컬러 `--color-primary`(focus 인디케이터, 강조 보더, primary 액션 배경 등)와 그 옅은 파생 `--color-primary-soft`로 이루어진다. 이름은 Material Design 3의 `primary`·`on-primary`를 따른다.

출처: https://m3.material.io/styles/color/roles
> Use primary roles for the most prominent components across the UI, such as the FAB, high-emphasis buttons, and active states.
> Primary: High-emphasis fills, texts, and icons against surface
> On primary: Text and icons against primary

`--color-primary-soft`는 브랜드의 옅은 바탕(선택 칩·옅은 강조)이다. 기본값은 바탕색(`--color-bg-default`)에 `--color-primary`를 10% 섞은 색이라, 브랜드나 바탕을 덮으면 따라온다. 정보 알림 바탕 `--color-bg-info-soft`와 값이 같더라도 따로 둔다 — 브랜드 옅은 색이 필요한 곳이 정보용 이름을 빌려 쓰지 않게 하기 위해서다.

주변과 반대로 어두워야 하는 바탕(말풍선 등)은 `--color-bg-inverse`로 칠하고, 그 위 글자·아이콘은 `--color-on-inverse`를 쓴다. 브랜드 토큰으로 칠하면 브랜드가 검정인 테마에서는 드러나지 않지만, 쓰는 쪽이 브랜드를 파랑으로 덮는 순간 어두워야 할 바탕이 파랗게 나온다. 브랜드 색으로 보여야 하는 토스트는 `--color-primary`로 칠한다. 이름은 Material Design 3의 inverse 역할을 따른다.

출처: https://m3.material.io/styles/color/roles
> Inverse roles are applied selectively to components to achieve colors that are the reverse of those in the surrounding UI, creating a contrasting effect.
> Inverse surface: Background fills for elements which contrast against surface
> Inverse on surface: Text and icons against inverse surface

`on-X` (예: `--color-on-primary`)는 X 배경 위에 올라갈 텍스트 색 관용 패턴. 별도 카테고리.

도메인 특수 토큰(코드 블록·인용구)은 파생 단어 규칙 밖이라 그대로 둔다 (`--color-code-block-bg` 등).

## CSS 변수 패러다임

SCSS 변수(`$name`)가 아니라 CSS 사용자 정의 속성(`--name`)으로 정의한다. 런타임에 테마 교체·다크모드 토글이 가능해야 하기 때문. SCSS 변수는 컴파일 타임 치환이라 런타임 변경 불가.

CSS 변수는 cascade로 상속되므로 `@use` 같은 명시적 import 없이 테마 클래스에 선언된 토큰을 그 아래 어디서나 `var(--...)`로 참조할 수 있다.

토큰은 `design-tokens.module.scss`의 `.theme` 클래스에 선언하고, 패키지는 빌드 때 해시된 그 클래스명을 `themeClassName`으로 export한다. 쓰는 쪽은 `<body>`에 `themeClassName`과 자기 module class를 함께 붙이고, 자기 클래스에서 토큰을 덮어쓴다. 두 클래스는 우선순위가 같으므로 디자인 시스템 CSS 뒤에 불러온 쪽이 이긴다. Radix Themes가 `.radix-themes`로 테마를 덮어쓰게 하는 것과 같은 방식이다. 쓰는 쪽 안내는 README [테마 바꾸기](../../README.md#테마-바꾸기)에 있다.

출처: https://www.radix-ui.com/themes/docs/theme/color
> Make sure that your CSS is applied after the Radix Themes styles so that it takes precedence.

대신 CSS 변수는 빌드 시점 검증을 받지 못한다. `var(--color-fg-defualt)`처럼 이름을 잘못 적어도 컴파일 단계에서 걸리지 않고, 런타임에 값이 비어 조용히 깨진다.

정의되지 않은 변수를 컴파일 에러로 잡아주는 SCSS 변수의 안전성을 런타임 교체 능력과 맞바꾼 셈이다. 런타임 테마 교체가 이 시스템의 목표라 이 검증 손실은 감수한다.

## SCSS 변수 vs CSS 변수 사용 구분

### 순서: 먼저 토큰화 시도

1. **공통화·재사용 가능한 의미가 있으면 토큰(CSS 변수)으로** — 컬러·spacing 스케일·font-size·radius, 다른 컴포넌트도 쓸 만한 shadow 등.
2. **시도해 봤더니 그 컴포넌트 한 곳에서만 의미 있는 값**이면 그 파일의 SCSS 로컬 변수로 — Dialog `max-width: 328px`, Drawer `width: 280px`, Dialog만의 box-shadow 3-stop 조합 등.

판단 기준은 **명명**으로 드러난다.

- 의미 단어로 명명 가능 (`md`, `lg`, `primary`, `subtle`) → 토큰
- 컴포넌트명/특정 사이즈가 박혀야만 식별 가능 (`paperShadow`, `dialogMaxWidth`) → SCSS 로컬

### 금지: 공통화 불가능한 값을 토큰 파일에 두기

**가장 나쁜 패턴**이다. 예: `--shadow-dialog`는 Dialog 한 곳에서만 의미 있는 깊이/길이 조합이라 다른 컴포넌트가 재사용할 일이 없다. 그런데도 공통 토큰에 두면:

- 토큰 100컴포넌트 = `--shadow-dialog`, `--shadow-drawer`, `--shadow-tooltip`, ... 무한 증식
- 테마 교체할 때 일괄 갱신 의미가 사라짐 (이미 컴포넌트 단위로 분기)
- 토큰의 정체성 상실

이런 값은 해당 컴포넌트 `module.scss` 상단에 SCSS 로컬 변수로 둔다. 단 lint(`declaration-property-value-disallowed-list`)가 raw 값 SCSS 변수를 막으므로, 일회성임을 명시하는 `stylelint-disable + 사유`를 함께 단다.

```scss
$paperShadow: (
  0 11px 15px -7px rgb(0 0 0 / 20%),
  ...
);
```

shadow 형태(ring vs depth) 자체가 여러 컴포넌트에서 공유될 가능성이 있으면 토큰화한다 (예: `--shadow-focus`는 input·button focus 링, `--shadow-hover`는 카드·타일의 호버 elevation depth).

## z-index는 CSS 변수가 아니라 SCSS 맵

z-index는 토큰(CSS 변수)으로 두지 않고 `src/styles/design-system.module.scss`의 `$zIndexes` 맵에 둔다. 맵에는 디자인 시스템 부품의 층만 둔다(`modal` 400, `toast` 500).

- **런타임에 바꿀 값이 아니다.** CSS 변수로 두는 이유(테마 교체)가 층 순서에는 없다. 반대로 SCSS 맵은 없는 키를 꺼내면 컴파일 에러가 나서, CSS 변수가 잃는 빌드 시점 검증을 되찾는다.
- **층은 쓰는 앱마다 다르다.** sticky 헤더·드롭다운처럼 앱이 만드는 층은 디자인 시스템이 알 수 없다. 앱은 패키지가 내보내는 맵(`@developer-choi/design-system/styles/design-system`)을 `map.merge`로 자기 맵에 합쳐 쓴다. 예: `apps/examples/src/shared/styles/_z-index.scss`
- **100 단위로 띄운다.** 앱이 디자인 시스템 층 사이·아래에 자기 층을 끼울 자리를 남긴다. 디자인 시스템은 이 간격을 유지한다.

stylelint `declaration-strict-value`는 `z-index`에 숫자를 막고 `map.get()`으로 꺼낸 값은 통과시킨다([stylelint.md](../../../../docs/static-checking/stylelint.md)).
