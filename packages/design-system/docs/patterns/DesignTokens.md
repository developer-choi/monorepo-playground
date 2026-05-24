# 디자인 토큰

> 적용 범위: `packages/design-system` 내부. 다른 패키지는 적용 대상이 아니다.

## 목적

**테마를 바꿀 때 여기만 바꾸면 된다.**

색·여백·폰트를 raw 리터럴로 박으면 톤을 바꿀 때 전 코드를 grep해야 한다. 토큰으로 추상화하면 토큰 정의 한 곳만 바꿔 전 영역에 반영된다. 이 디자인 시스템은 **마크업은 공유, 시각 스타일은 채용과제별로 교체**가 목표라 일괄 교체가 핵심이다.

## 출처

토큰의 회색조 톤은 [my-else/blog의 globals.scss](https://github.com/developer-choi/blog/blob/master/src/app/globals.scss)에서 가져왔지만, **이 레포가 캐논**이다. 명명·구성은 이 문서의 정책을 따른다 (blog는 톤 레퍼런스).

## 컬러 명명 원칙

### 대상 단어는 fg / bg 두 개만

색 토큰의 "대상"(어디에 들어가는지)을 가리키는 단어는 **fg**와 **bg**만 사용한다. text / border / surface / icon 같은 단어는 쓰지 않는다.

- **fg** (foreground) — 전경. 텍스트·아이콘·**보더**(보더도 윤곽 그리는 전경 역할).
- **bg** (background) — 배경. 표면(카드·모달·시트), 페이지 배경.

대상 단어를 늘리면(text/border/surface/icon...) 같은 톤의 색이 카테고리별로 흩어져 테마 교체 시 일괄성이 깨진다. fg/bg 두 개로 묶어두면 같은 톤 색이 하나의 토큰 아래 모인다.

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
--color-bg-secondary: #f5f5f5;   /* hover, 카드, 강조 박스 등 공유 */
--color-fg-accent: #1a1a1a;      /* focus 보더, 액센트 텍스트 등 공유 */
```

호버 상태는 컴포넌트가 적절한 토큰을 골라 쓴다.

```scss
.menuItem:hover {
  background-color: var(--color-bg-secondary);
}
```

> 이 "상태 박힘 금지"는 **컬러에 한정**한다. spacing·font·radius·shadow는 상태별로 분기될 일이 거의 없어 동일 원칙을 강제하지 않는다.

### 파생 단어

fg / bg 안에서 의미 단어로 파생한다.

| suffix | 의미 |
|---|---|
| `primary` | 메인 (텍스트의 가장 진한 색, 배경의 흰색 등) |
| `secondary` | 보조 단계 |
| `tertiary` | 더 옅은 배경 (선택 상태·info 박스 등 공유) |
| `muted` | 흐릿한 (placeholder, disabled 텍스트 등) |
| `subtle` | 가장 약함 (가는 보더, 디바이더 등) |
| `accent` | 강조 (focus 인디케이터, 강조 보더, primary 액션 배경 등) |
| `destructive` | 돌이킬 수 없는 위험·삭제 액션 |

`on-X` (예: `--color-on-accent`)는 X 배경 위에 올라갈 텍스트 색 관용 패턴. 별도 카테고리.

도메인 특수 토큰(코드 블록·인용구)은 파생 단어 규칙 밖이라 그대로 둔다 (`--color-code-block-bg` 등).

## CSS 변수 패러다임

SCSS 변수(`$name`)가 아니라 CSS 사용자 정의 속성(`--name`)으로 정의한다. 런타임에 테마 교체·다크모드 토글이 가능해야 하기 때문. SCSS 변수는 컴파일 타임 치환이라 런타임 변경 불가.

CSS 변수는 cascade로 상속되므로 `@use` 같은 명시적 import 없이 `:root`에 선언된 토큰을 어디서나 `var(--...)`로 참조할 수 있다.

## SCSS 변수 vs CSS 변수 사용 구분

- **CSS 변수 (`--name`)** — 디자인 토큰. 컬러·radius·font-size·spacing·shadow 등 테마 단위 교체 대상.
- **SCSS 변수 (`$name`)** — 컴포넌트 로컬 상수. 그 컴포넌트에서만 의미 있는 1회성 값(예: Dialog `max-width: 600px`, Drawer `width: 280px`), SCSS 컨디셔널, 믹스인.

**판단 기준:** 2개 이상 파일에서 같은 값이 반복되면 토큰으로, 1개 파일 전용이면 그 파일의 SCSS 변수로.

```scss
$dialogMaxWidth: 600px;
$drawerWidth: 280px;
```

테마 교체와 무관한 컴포넌트 고유 사이즈는 토큰화하지 않는다.
