'use client';

import {Card, TextField} from '@monorepo-playground/design-system';
import {memo, useDeferredValue, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './page.module.scss';

export default function HeavyPage() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.grid2}>
        <LeftBadUsage />
        <RightGoodUsage />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className={styles.section}>
      <h2 className={clsx(typography.h2, styles.heading)}>useDeferredValue 렌더링 비교</h2>
      <p className={clsx(typography.body1, styles.description)}>150개 아이템 × 1ms = 약 150ms 렌더링 시간</p>
      <div className={styles.linkWrap}>
        <Link
          className={typography.body2}
          href="https://react.dev/reference/react/useDeferredValue#examples"
          target="_blank"
        >
          React 공식문서 원본 예제
        </Link>
      </div>
    </div>
  );
}

function LeftBadUsage() {
  const [text, setText] = useState('');

  return (
    <Card>
      <h4 className={clsx(typography.h4, styles.titleBad)}>Without useDeferredValue</h4>

      <div className={styles.inputWrap}>
        <TextField
          autoFocus
          placeholder="타이핑해보면 렉이 아주 심하게 걸립니다."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <SlowList text={text} />
    </Card>
  );
}

function RightGoodUsage() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <Card>
      <h4 className={clsx(typography.h4, styles.titleGood)}>With useDeferredValue</h4>

      <div className={styles.inputWrap}>
        <TextField
          placeholder="타이핑해도 렉이 걸리지 않습니다"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </div>

      <SlowList text={deferredText} />
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- memo로 감싼 컴포넌트는 JSX 사용을 위해 PascalCase 변수가 필수
const SlowList = memo(function SlowList({text}: {text: string}) {
  const items = [];
  for (let index = 0; index < SLOW_LIST_ITEM_COUNT; index++) {
    items.push(<SlowItem key={index} text={text} />);
  }

  return <div>{items}</div>;
});

function SlowItem({text}: {text: string}) {
  // 아이템당 1ms 지연 시뮬레이션
  // eslint-disable-next-line react-hooks/purity
  const startTime = performance.now();
  // eslint-disable-next-line react-hooks/purity
  while (performance.now() - startTime < 1) {
    // 1ms 동안 블로킹
  }

  return (
    <div className={styles.slowItem}>
      <span className={typography.body1}>Text: {text}</span>
    </div>
  );
}

const SLOW_LIST_ITEM_COUNT = 150;
