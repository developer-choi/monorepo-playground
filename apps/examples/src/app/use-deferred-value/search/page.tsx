'use client';

import {Box, Card, Container, Heading, Link, Text, TextField} from '@radix-ui/themes';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {memo, useDeferredValue, useState} from 'react';
import {useSuspenseQuery} from '@tanstack/react-query';

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
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <Box mb="4">
        <TextField.Root
          placeholder="검색어를 입력하세요."
          size="3"
          value={query}
          onChange={e => setQuery(e.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon/>
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Box>
        <SearchResults query={deferredQuery}/>
      </Box>
    </>
  );
}

const SearchResults = memo(function SearchResults({query}: {query: string}) {
  const {data: results = []} = useSuspenseQuery({
    queryKey: ['search', query],
    queryFn: () => getSearchResultsApi(query),
  });

  return (
    <Box>
      {results.map((result, i) => (
        <Card key={i} mb="2">
          <Box p="3">
            <Text>
              <Highlight text={result} query={query} />
            </Text>
          </Box>
        </Card>
      ))}
    </Box>
  );
});

async function getSearchResultsApi(query: string): Promise<string[]> {
  if (!query) {
    return [];
  }

  await new Promise(resolve => setTimeout(resolve, 200));

  return [
    `a${query}b 관련 결과`,
    `a${query} 관련 결과`,
    `${query}b 관련 결과`,
    `xy${query}z 관련 결과`,
    `${query}d 관련 결과`,
  ];
}

function Highlight({text, query}: {text: string; query: string}) {
  if (!query) return <>{text}</>;

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} weight="bold" style={{backgroundColor: 'var(--yellow-4)'}}>
            {part}
          </Text>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
