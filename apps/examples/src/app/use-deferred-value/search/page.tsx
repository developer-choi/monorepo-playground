import {Box, Card, Container, Heading, Link, Text, TextField} from '@radix-ui/themes';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';

export default function SearchPage() {
  return (
    <Container size="2" p="6">
      <Header/>
      <SearchForm/>
    </Container>
  );
}

function Header() {
  return (
    <Box mb="6">
      <Heading size="7" mb="2">검색결과 목록 Best Practice</Heading>
      <Box mt="2">
        <Link
          href="https://react.dev/reference/react/useDeferredValue#showing-stale-content-while-fresh-content-is-loading"
          target="_blank"
          size="2"
        >
          구현과정은 Roadmap.md 참고해주세요. (링크)
        </Link>
      </Box>
    </Box>
  );
}

function SearchForm() {
  return (
    <>
      <Box mb="4">
        <TextField.Root placeholder="검색어를 입력하세요." size="3">
          <TextField.Slot>
            <MagnifyingGlassIcon/>
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Box>
        {Array.from({length: 5}, (_, i) => (
          <Card key={i} mb="2">
            <Box p="3">
              <Text>검색결과 {i + 1}</Text>
            </Box>
          </Card>
        ))}
      </Box>
    </>
  );
}
