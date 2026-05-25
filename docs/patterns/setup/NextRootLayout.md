# Next.js Root Layout — Google Fonts

## 상황

Next.js App Router 프로젝트에서 디자인 시안에 별도 폰트 지정이 없을 때, Noto Sans KR을 기본 폰트로 적용.

## 기술스택

Next.js App Router + next/font/google

## 코드

```tsx
import {Noto_Sans_KR} from 'next/font/google';
import {PropsWithChildren} from 'react';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function RootLayout({children}: PropsWithChildren) {
  return (
    <html>
      <body className={notoSansKr.className}>{children}</body>
    </html>
  );
}
```

## 주의사항

### subsets는 `latin`이면 충분

알파벳·숫자·기본 기호만 포함. 한글은 어차피 Noto Sans KR이 자체적으로 커버하므로 `latin-ext`, `cyrillic` 등은 불필요한 다운로드.

### localFont + googleFont 동시 적용 불가

```tsx
<body className={classNames(localFont.className, googleFont.className)}>
```

두 폰트를 `className`에 합쳐 넘기면 둘 중 하나만 적용된다. 회피: Google Font 파일을 직접 다운받아 `localFont`의 `src`에 포함시켜 단일 폰트로 만든 뒤 className 전달.

### 무거운 폰트는 root layout에 넣지 않는다

이모지 폰트(예: Noto Color Emoji ~5MB)를 root layout에서 다른 폰트와 묶어 선언하면, 모든 페이지 첫 진입 시 이 폰트 preload가 끝날 때까지 텍스트 렌더링이 차단된다.

판단 기준:
- preload 할 만큼 모든 페이지에서 중요한가?
- 모든 구역에 노출되는가?

둘 다 아니면 root layout에서 제외하고 필요한 컴포넌트에서만 적용한다.

```tsx
function EmojiSection(): JSX.Element {
  return <div className={emojiFont.className}>⏰</div>;
}
```
