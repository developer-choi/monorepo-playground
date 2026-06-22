# packages/design-system 컨벤션

> 이 컨벤션은 `packages/design-system` 내부 코드에만 적용된다. `apps/*` 등은 적용 대상이 아니다.

이 레포의 디자인 시스템은 **학습** + **"마크업은 공유, 시각 스타일은 채용과제별로 교체"** 패턴을 목표로 한다. 그래서 마크업과 시각을 명시적으로 분리한다.

## 폴더 구조

컴포넌트는 **카테고리 폴더 안에 플랫 파일**로 둔다. 폴더는 둘 이상을 묶을 때만 두므로, 컴포넌트 하나를 감싸는 폴더(`Button/Button.tsx`)는 만들지 않는다.

```
src/components/
├── inputs/          # Button, IconButton, InputBase, TextField, TextArea,
│   ├── Button.tsx           PasswordField, Select, Checkbox, Radio, RadioGroup, Label
│   ├── Button.module.scss
│   ├── Button.stories.tsx
│   └── ...
├── feedback/        # Callout, Spinner
│   ├── modal/       # 관련 컴포넌트 묶음은 카테고리 안 kebab 서브폴더로 (Dialog, Alert, Confirm)
│   └── ...
├── data-display/    # Badge, Caption, Table
└── surfaces/        # Card
```

- **카테고리**는 [MUI 분류](https://mui.com/material-ui/all-components/)를 차용한다(Inputs/Feedback/Data Display/Surfaces). 새 컴포넌트는 MUI가 두는 카테고리에 맞춰 배치한다.
- **파일명**은 `ComponentName.tsx` / `ComponentName.module.scss` / `ComponentName.stories.tsx` — PascalCase, 컴포넌트명과 1:1. (파일명 규칙은 `eslint.config.base.mts`의 `filename-export-convention`이 강제.)
- **폴더명**은 카테고리·묶음 모두 kebab-case. (`check-file/folder-naming-convention`이 `src/**/*`에 강제 — [eslint.md](static-checking/eslint.md) 참고.)
- **컴포넌트 묶음**(`Dialog`와 그 위에 얹은 `Alert`·`Confirm`처럼 관련 컴포넌트 둘 이상)은 카테고리 폴더 안에 kebab 서브폴더로 둔다. 하나뿐이면 폴더 없이 플랫 파일로 둔다.
- **스토리북 `title`은 폴더 경로와 1:1 일치**시킨다: `components/<category>/<Component>.tsx` → `title: 'Components/<category>/<Component>'`. 묶음은 `Components/feedback/modal/Alert`처럼 서브폴더까지 반영한다.

## 마크업/시각 스타일 분리

### 중첩 클래스 패턴

같은 `*.module.scss` 안에서 마크업/시각 두 영역을 중첩 클래스로 나눈다.

- `.X` — 마크업 (동작에 필수: display, position, overflow, 크기 제약 등)
- `.X.styled` — 시각 (색, padding, font, radius, shadow 등)

엘리먼트에는 두 클래스를 함께 적용한다.

```scss
.paper {
  display: flex;
  max-width: $dialogMaxWidth;
  // ... 마크업
}

.paper.styled {
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-dialog);
  // ... 시각
}
```

### 마크업 vs 시각 기준

**`.styled`를 입히지 않은 상태가 headless 컴포넌트다.** radix primitives처럼 구조·동작·접근성만 남고 룩은 없는 상태가 되도록 나눈다. 판단이 애매하면 "headless 라이브러리가 이 속성을 출하할까"로 묻는다.

단, 이 레포의 headless는 박스 모델이 무너지지 않을 최소 구조(display, position, overflow, 크기 제약)까지는 포함한다.

- 다이얼로그의 `max-width: 600px` → **마크업** (없으면 뷰포트에 무한히 늘어남 — 구조)
- 다이얼로그의 `background-color: var(--color-bg-primary)` → **시각** (룩)
- 슬롯 사이 `gap`, 타이포 믹스인 → **시각** (간격·글꼴은 미관이지 구조가 아니다)
- 타이포 믹스인은 TSX에서 `typography.bodyN` 클래스를 직접 붙이지 않고 `.X.styled` 안에서 `@include`한다 — headless 상태에 글꼴이 새지 않게.

### 시각 속성이 없는 클래스

`.X.styled`가 비면 만들지 않는다 (예: `.container` 같이 마크업만 필요한 경우).

## 다중 클래스 조합: clsx

`${a} ${b}` 템플릿 리터럴은 CSS Module 타입이 `string | undefined`라서 ESLint `restrict-template-expressions`에 막힌다. `clsx`를 쓴다.

```tsx
import clsx from 'clsx';

<div className={clsx(styles.paper, styles.styled)}>...</div>
```

## 디자인 토큰

토큰을 다룰 때는 [packages/design-system/docs/patterns/DesignTokens.md](../packages/design-system/docs/patterns/DesignTokens.md)를 따른다.
