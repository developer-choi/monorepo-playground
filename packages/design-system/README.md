# 디자인 시스템

여러 프로젝트가 함께 쓰는 화면 부품(버튼·입력창·모달 등)을 한곳에 모아 만든 디자인 시스템입니다. 색·여백·글자 크기 같은 시각 기준도 한곳에 모아, 그 기준만 바꾸면 전체 톤이 한 번에 바뀝니다.

- [컴포넌트 라이브 데모](https://design-system-eta-six.vercel.app/): 부품을 직접 눌러보며 동작을 확인할 수 있습니다.
- [디자인 시스템 구축기](docs/guides/design-system/step1.md): 표준화부터 모노레포까지 발전 과정을 4단계로 정리했습니다.

## 설치

```bash
npm install @developer-choi/design-system
```

React 19가 필요합니다.

## 버전

1.0 전까지는 아래 규칙으로 올립니다.

- **patch** (`0.1.0` → `0.1.1`): 버그 수정. 쓰는 쪽 코드를 고칠 필요가 없습니다.
- **minor** (`0.1.0` → `0.2.0`): 기능 추가, 또는 쓰는 쪽 코드를 고쳐야 하는 변경(props·토큰 이름 변경 등). 고쳐야 하는 변경이 있으면 [CHANGELOG.md](CHANGELOG.md)에 무엇을 어떻게 바꾸면 되는지 적습니다.

`package.json`의 `version`을 올린 PR이 master에 머지되면 GitHub Actions가 npm에 배포합니다. 이미 배포된 버전이면 건너뜁니다.

버전마다 바뀐 것은 [CHANGELOG.md](CHANGELOG.md)에 있습니다.

## 테마 바꾸기

색·여백 같은 토큰은 `themeClassName`이 붙은 요소 아래에서만 적용됩니다. [Radix Themes](https://www.radix-ui.com/themes/docs/theme/color)가 `.radix-themes` 아래에 토큰을 두고 덮어쓰게 하는 것과 같은 방식입니다.

1. `<body>`에 `themeClassName`을 붙입니다. 모달처럼 `<body>`로 portal되는 부품까지 토큰을 받습니다.
2. 같은 `<body>`에 자기 클래스를 함께 붙이고, 그 클래스에서 토큰을 덮어씁니다. 그 CSS는 디자인 시스템 CSS **뒤에** 불러옵니다.

```tsx
// app/layout.tsx
import '@developer-choi/design-system/style.css';
import {themeClassName} from '@developer-choi/design-system';
import styles from './layout.module.css';

<body className={clsx(themeClassName, styles.theme)}>...</body>;
```

```css
/* layout.module.css */
.theme {
  --color-primary: #1971c2;
}
```

덮어쓸 수 있는 토큰 목록은 [design-tokens.module.scss](src/styles/design-tokens.module.scss)에 있습니다.

## z-index

모달·토스트의 층은 SCSS 맵 `$zIndexes`(모달 400, 토스트 500)로 정합니다. 앱의 sticky 헤더·드롭다운처럼 자기 층이 필요하면 이 맵에 합쳐 씁니다. 100 단위 사이에 끼우면 됩니다.

```scss
// _z-index.scss
@use 'sass:map';
@use '@developer-choi/design-system/styles/design-system';

$zIndexes: map.merge(
  design-system.$zIndexes,
  (
    stickyHeader: 100,
  )
);

// map.get은 없는 키면 null이라 선언이 조용히 빠진다. 꺼낼 때는 이 함수를 쓴다.
@function zIndex($key) {
  @if not map.has-key($zIndexes, $key) {
    @error 'z-index "#{$key}" not found';
  }

  @return map.get($zIndexes, $key);
}
```

```scss
// Header.module.scss
@use 'z-index';

.header {
  position: sticky;
  z-index: z-index.zIndex(stickyHeader);
}
```

이유는 [DesignTokens.md](docs/patterns/DesignTokens.md#z-index는-css-변수가-아니라-scss-맵)에 있습니다.
