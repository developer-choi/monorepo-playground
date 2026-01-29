'use client';

import {Box, Card, Container, Flex, Grid, Heading, Link, Text, TextField} from '@radix-ui/themes';
import {memo, useDeferredValue, useState} from 'react';

export default function HeavyPage() {
  return (
    <Container size="4" p="6">
      <Header/>

      <Grid columns="2" gap="4">
        <LeftBadUsage/>
        <RightGoodUsage/>
      </Grid>
    </Container>
  );
}

function Header() {
  return (
    <Box mb="6">
      <Heading size="7" mb="2">useDeferredValue 렌더링 비교</Heading>
      <Text color="gray">
        150개 아이템 × 1ms = 약 150ms 렌더링 시간
      </Text>
      <Box mt="2">
        <Link
          href="https://react.dev/reference/react/useDeferredValue#examples"
          target="_blank"
          size="2"
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
        <Heading size="4" mb="4" color="red">
          Without useDeferredValue
        </Heading>

        <TextField.Root
          placeholder="타이핑해보면 렉이 아주 심하게 걸립니다."
          value={text}
          onChange={e => setText(e.target.value)}
          mb="4"
        />

        <SlowList text={text}/>
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
        <Heading size="4" mb="4" color="green">
          With useDeferredValue
        </Heading>

        <TextField.Root
          placeholder="타이핑 해도 렉이 걸리지 않아요"
          value={text}
          onChange={e => setText(e.target.value)}
          mb="4"
        />

        <SlowList text={deferredText}/>
      </Box>
    </Card>
  );
}

const SlowList = memo(function SlowList({text}: {text: string}) {
  const items = [];
  for (let i = 0; i < 150; i++) {
    items.push(<SlowItem key={i} text={text} />);
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

  return (
    <Flex py="2" style={{borderBottom: '1px solid var(--gray-4)'}}>
      <Text>Text: {text}</Text>
    </Flex>
  );
}
