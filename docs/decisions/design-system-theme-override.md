# 디자인 시스템 토큰을 쓰는 쪽이 덮어쓰게 하는 방식

## 목표

디자인 시스템을 npm으로 받아 쓰는 다른 레포가 색 같은 토큰을 자기 값으로 바꿀 수 있게 합니다.

전제는 두 가지입니다.

- 테마 시스템을 새로 개발하지 않습니다. 디자인 시스템이 쓰는 쪽 프로젝트의 핵심이 아니라서, 토큰을 덮어쓸 수 있는 데까지만 손봅니다.
- 쓰는 쪽은 앱 루트에서 한 번 세팅하고 바꾸지 않습니다.

## 왜 방식이 중요한가

바꾸기 전 토큰은 `:root`에 선언돼 있었습니다.

```css
:root {
  --color-fg-accent: #1a1a1a;
}
```

쓰는 쪽이 같은 `:root`로 덮으면 우선순위가 같아서 **나중에 로드된 쪽이 이깁니다.** Next.js는 CSS 순서가 import 순서를 따른다고 적습니다.

> "The **order of your CSS** depends on the **order you import styles in your code**." ([Next.js CSS](https://nextjs.org/docs/app/getting-started/css))

그래서 방식마다 "쓰는 쪽의 덮어쓰기가 무엇에 기대어 이기는가"가 다릅니다. 로드 순서, 셀렉터 우선순위, 상속 거리 셋 중 하나입니다.

## 구현 방법

측정은 `apps/examples`(Next 16.1.1)에서 했습니다. 경우마다 `next build`와 `next start`를 새로 돌려 Button의 계산된 배경색을 쟀습니다. "자연 순서"는 디자인 시스템 CSS를 먼저, 덮어쓰기 CSS를 나중에 import한 것입니다. "역순"은 import 자동 정렬 등으로 뒤집힌 경우를 흉내 낸 것입니다.

### 방법 A. `:root`를 그대로 두고 쓰는 쪽이 `body`에서 덮는다

```css
/* 디자인 시스템: 변경 없음 */
:root { --color-fg-accent: #1a1a1a; }

/* 쓰는 쪽 */
body { --color-fg-accent: blue; }
```

- 자연 순서와 역순 모두 이겼습니다. `body`가 `:root`보다 안쪽 요소라, 상속 거리로 이깁니다.
- 디자인 시스템은 한 줄도 바꾸지 않습니다.
- 쓰는 쪽이 `:root`로 덮으면 다시 순서 싸움이 됩니다. "body에서 덮으라"는 약속을 문서로만 지킵니다.

### 방법 B. 토큰을 테마 클래스 아래에 두고 쓰는 쪽이 감싼다 (Radix Themes 방식)

```css
/* 디자인 시스템 */
.ds-theme { --color-fg-accent: #1a1a1a; }

/* 쓰는 쪽: <body class="ds-theme"> */
.ds-theme { --color-fg-accent: blue; }
```

[Radix Themes](https://www.radix-ui.com/themes/docs/theme/color)가 안내하는 덮어쓰기 방식입니다.

> "override CSS variables within the `.radix-themes` selector" / "Make sure that your CSS is applied after the Radix Themes styles so that it takes precedence."

| 덮어쓰기 | 자연 순서 | 역순 |
|---|---|---|
| 같은 셀렉터 `.ds-theme { … }` | 이김 | **짐** |
| 더 구체적인 셀렉터 `.ds-theme.xxx { … }` | 재지 않음 | 이김 |
| 테마 요소 안쪽 요소에 선언 | 재지 않음 | 이김 |
| `body { … }` | **짐** | 재지 않음 |

- 같은 셀렉터로 덮으면 순서 싸움입니다. Radix 문서가 순서 경고를 따로 두는 이유입니다.
- `body`(0,0,1)로 덮으면 `.ds-theme`(0,1,0)보다 우선순위가 낮아 자연 순서에서도 집니다.
- 쓰는 쪽이 클래스를 빠뜨리면 토큰이 통째로 사라집니다.

Radix Themes 배포 CSS(3.3.0)를 받아 보면, Radix는 토큰 전부를 클래스에 두지 않습니다. 원색 팔레트는 `:root`에, 간격·글꼴은 `.radix-themes`에, 강조색은 `data-accent-color` 속성에, 배경은 `:where(.radix-themes)`에 있습니다. 그래서 "클래스를 빠뜨리면 색이 사라진다"는 약점은 토큰을 전부 클래스로 옮긴 이 방식에만 있습니다.

### 방법 C. 디자인 시스템 토큰의 우선순위를 0으로 낮춘다

```css
/* 디자인 시스템 */
:where(:root) { --color-fg-accent: #1a1a1a; }
```

> "`:where()` always has 0 specificity" ([MDN :where()](https://developer.mozilla.org/en-US/docs/Web/CSS/:where))

- `body`로 덮은 역순에서 이겼습니다. 다만 `body`로 덮으면 A도 이기므로, C가 더해 주는 것은 쓰는 쪽이 `:root`로 덮을 때뿐입니다. 그 경우는 재지 않았습니다.

### 뺀 방법: JS 테마 Provider

`<ThemeProvider theme={…}>`가 인라인 style로 변수를 넣는 방식(Mantine 계열)입니다. 컴포넌트를 새로 만들고 RSC 경계까지 신경 써야 해서, 목표의 "새로 개발하지 않는다"를 넘습니다.

## 결론

**B를 고르고, 테마 클래스는 CSS Module 클래스로 만들어 `themeClassName`으로 내보냅니다.**

```ts
// src/styles/theme.ts
import designTokens from '@/styles/design-tokens.module.scss';

export const themeClassName = designTokens.theme!;
```

쓰는 쪽은 `<body>`에 `themeClassName`과 자기 module 클래스를 함께 붙이고, 자기 클래스에서 토큰을 덮어씁니다. 두 클래스 모두 우선순위가 (0,1,0)이라, 덮어쓰기 CSS를 디자인 시스템 CSS **뒤에** 불러와야 이깁니다. 쓰는 법은 [패키지 README 「테마 바꾸기」](../../packages/design-system/README.md#테마-바꾸기)에 있습니다.

- **B를 고른 이유:** 기능만 보면 A도 디자인 시스템 변경 없이 똑같이 동작합니다. B를 고른 실익은 Radix Themes와 같은 구조라 쓰는 쪽에 설명하기 쉽다는 점입니다. 순서 의존은 "한 번 세팅하고 안 바꾼다"는 전제로 받아들였습니다.
- **처음에는 전역 클래스 `.ds-theme`으로 만들었다가 바꿨습니다.** 이 레포의 다른 클래스는 전부 `styles.xxx`로 받는 module 클래스인데, 이것만 쓰는 쪽이 문자열로 적는 전역 클래스였습니다. stylelint의 camelCase 규칙에도 걸려 disable 주석이 필요했습니다. module 클래스로 내보내면 쓰는 쪽이 문자열을 전혀 적지 않습니다. Radix가 `<Theme>`로 클래스를 대신 붙여 주는 것과도 가깝습니다.
- **클래스는 `<body>`에 붙입니다.** Radix는 `<Theme>`가 body 안쪽 div에 클래스를 붙입니다. 그런데 `global.css`의 `body { color: var(--color-fg-primary); }`는 토큰이 안쪽 div에 걸리면 토큰을 못 읽습니다. body에 붙이면 모달처럼 body로 portal되는 부품도 토큰을 받습니다.
- **`<Theme>` 컴포넌트, data 속성, 12단계 팔레트는 가져오지 않았습니다.** 목표의 "새로 개발하지 않는다" 밖입니다.

### 확인한 것

- 바꾸기 전후 Storybook 71개 스토리와 examples 14개 페이지의 모든 요소 계산 스타일(21개 속성)을 비교해 테마 관련 차이가 없었습니다. production 배포 뒤에도 같은 비교를 했습니다.
- body로 portal되는 Dialog가 배경·radius 토큰을 받습니다.
- 쓰는 쪽(Next 16.1.1)에서 `next dev`, `next build`, Vercel Preview 세 곳 모두 덮어쓴 색이 나왔습니다.

### 다른 방법을 고르지 않은 이유

- **A:** 가장 싸지만, 쓰는 쪽에 주는 약속("body에서 덮으라")이 구조가 아니라 문서에만 있습니다. 설명할 때 기댈 사례도 없습니다.
- **C:** A 위에 얹는 보험입니다. body로 덮는 사용 방식에서는 더해 주는 것이 없었습니다.
- **JS Provider:** 목표 범위를 넘습니다.
