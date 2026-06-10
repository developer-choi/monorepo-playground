'use client';

import {Box, Card, Container, Flex, Grid, TextField} from '@radix-ui/themes';
import {memo, useDeferredValue, useState} from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './page.module.scss';

export default function HeavyPage() {
  return (
    <Container p="6" size="4">
      <Header />

      <Grid columns="2" gap="4">
        <LeftBadUsage />
        <RightGoodUsage />
      </Grid>
    </Container>
  );
}

function Header() {
  return (
    <Box mb="6">
      <h2 className={clsx(typography.h2, styles.heading)}>useDeferredValue 렌더링 비교</h2>
      <p className={clsx(typography.body1, styles.description)}>150개 아이템 × 1ms = 약 150ms 렌더링 시간</p>
      <Box mt="2">
        <Link
          className={typography.body2}
          href="https://react.dev/reference/react/useDeferredValue#examples"
          target="_blank"
        >
          React 공식문서 원본 예제
        </Link>
      </Box>
    </Box>
  );
}

function LeftBadUsage() {
  const [text, setText] = useState('');

  return (
    <Card>
      <Box p="4">
        <h4 className={clsx(typography.h4, styles.titleBad)}>Without useDeferredValue</h4>

        <TextField.Root
          autoFocus
          mb="4"
          placeholder="타이핑해보면 렉이 아주 심하게 걸립니다."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <SlowList text={text} />
      </Box>
    </Card>
  );
}

function RightGoodUsage() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);

  return (
    <Card>
      <Box p="4">
        <h4 className={clsx(typography.h4, styles.titleGood)}>With useDeferredValue</h4>

        <TextField.Root
          mb="4"
          placeholder="타이핑 해도 렉이 걸리지 않아요"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <SlowList text={deferredText} />
      </Box>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- memo로 감싼 컴포넌트는 JSX 사용을 위해 PascalCase 변수가 필수
const SlowList = memo(function SlowList({text}: {text: string}) {
  const items = [];
  for (let index = 0; index < SLOW_LIST_ITEM_COUNT; index++) {
    items.push(<SlowItem key={index} text={text} />);
  }

  return <Box>{items}</Box>;
});

function SlowItem({text}: {text: string}) {
  // 아이템당 1ms 지연 시뮬레이션
  // eslint-disable-next-line react-hooks/purity
  const startTime = performance.now();
  // eslint-disable-next-line react-hooks/purity
  while (performance.now() - startTime < 1) {
    // 1ms 동안 블로킹
  }

  /* eslint-disable no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. Radix 토큰 prop으로 대체 검토 필요 */
  return (
    <Flex py="2" style={{borderBottom: '1px solid var(--gray-4)'}}>
      <span className={typography.body1}>Text: {text}</span>
    </Flex>
  );
  /* eslint-enable no-restricted-syntax */
}

const SLOW_LIST_ITEM_COUNT = 150;
