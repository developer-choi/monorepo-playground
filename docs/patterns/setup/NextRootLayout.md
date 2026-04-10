# Next.js Root Layout — Google Fonts

## 상황

Next.js App Router 프로젝트에서 디자인 시안에 별도 폰트 지정이 없을 때, Noto Sans KR을 기본 폰트로 적용.

## 기술스택

Next.js App Router + next/font/google

## 코드

```tsx
import { Noto_Sans_KR } from 'next/font/google';
import { PropsWithChildren } from 'react';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body className={notoSansKr.className}>{children}</body>
    </html>
  );
}
```
