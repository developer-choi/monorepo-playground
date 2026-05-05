'use client';

import {memo, useDeferredValue, useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';
import {Box, Button, Card, Callout, Container, Heading, Text, TextField} from '@radix-ui/themes';
import {ExclamationTriangleIcon, MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {escapeRegExp} from 'es-toolkit';

export default function SearchPage() {
  return (
    <Container p="6" size="2">
      <Header />
      <SearchForm />
    </Container>
  );
}

function Header() {
  return (
    <Box mb="6">
      <Heading mb="2" size="7">
        검색결과 목록 Best Practice
      </Heading>
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
          autoFocus
          placeholder="검색어를 입력하세요."
          size="3"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Box>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <SearchResults query={deferredQuery} />
        </ErrorBoundary>
      </Box>
    </>
  );
}

const SearchResults = memo(function SearchResults({query}: {query: string}) {
  const {data: results = [], isPlaceholderData} = useQuery({
    queryKey: ['search', query],
    queryFn: () => getSearchResultsApi(query),
    placeholderData: keepPreviousData,
    retry: 0,
    throwOnError: true,
  });

  if (query !== '' && results.length === 0 && !isPlaceholderData) {
    return <Text color="gray">검색결과가 없습니다.</Text>;
  }

  return (
    <Box>
      {results.map((result, index) => (
        <Card key={index} mb="2">
          <Box p="3">
            <Text>
              <Highlight query={query} text={result} />
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

  await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));

  return [
    `a${query}b 관련 결과`,
    `a${query} 관련 결과`,
    `${query}b 관련 결과`,
    `xy${query}z 관련 결과`,
    `${query}d 관련 결과`,
  ];
}

function Highlight({text, query}: {text: string; query: string}) {
  if (!query) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {/* eslint-disable no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. Radix 토큰 prop으로 대체 검토 필요 */}
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={index} style={{backgroundColor: 'var(--yellow-4)'}} weight="bold">
            {part}
          </Text>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
      {/* eslint-enable no-restricted-syntax */}
    </>
  );
}

function ErrorFallback({resetErrorBoundary}: FallbackProps) {
  return (
    <Callout.Root color="red">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text>
        검색 중 오류가 발생했습니다.{' '}
        <Button size="1" variant="ghost" onClick={resetErrorBoundary}>
          다시 시도
        </Button>
      </Callout.Text>
    </Callout.Root>
  );
}

const SIMULATED_DELAY_MS = 200;
