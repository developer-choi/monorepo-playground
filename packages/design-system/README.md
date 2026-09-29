# 디자인 시스템

여러 프로젝트가 함께 쓰는 화면 부품(버튼·입력창·모달 등)을 한곳에 모아 만든 디자인 시스템입니다. 색·여백·글자 크기 같은 시각 기준도 한곳에 모아, 그 기준만 바꾸면 전체 톤이 한 번에 바뀝니다.

- [컴포넌트 라이브 데모](https://design-system-eta-six.vercel.app/): 부품을 직접 눌러보며 동작을 확인할 수 있습니다.
- [디자인 시스템 구축기](docs/guides/design-system/step1.md): 표준화부터 모노레포까지 발전 과정을 4단계로 정리했습니다.

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
  --color-bg-accent: #1971c2;
  --color-fg-accent: #1971c2;
}
```

덮어쓸 수 있는 토큰 목록은 [design-tokens.module.scss](src/styles/design-tokens.module.scss)에 있습니다.
