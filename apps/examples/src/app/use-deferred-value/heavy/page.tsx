import {Box, Card, Container, Flex, Grid, Heading, Link, Text, TextField} from '@radix-ui/themes';

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
  return (
    <Card>
      <Box p="4">
        <Heading size="4" mb="4" color="red">
          Without useDeferredValue
        </Heading>

        <TextField.Root placeholder="타이핑해보세요..." mb="4"/>

        <SearchResult/>
      </Box>
    </Card>
  );
}

function RightGoodUsage() {
  return (
    <Card>
      <Box p="4">
        <Heading size="4" mb="4" color="green">
          With useDeferredValue
        </Heading>

        <TextField.Root placeholder="타이핑해보세요..." mb="4"/>

        <SearchResult/>
      </Box>
    </Card>
  );
}

function SearchResult() {
  return (
    <Box>
      {Array.from({length: 10}, (_, index) => (
        <Flex
          key={index}
          py="2"
          style={{borderBottom: '1px solid var(--gray-4)'}}
        >
          <Text color="gray">Text: </Text>
        </Flex>
      ))}
    </Box>
  );
}