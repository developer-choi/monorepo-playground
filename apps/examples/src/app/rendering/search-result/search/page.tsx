'use client';

import {memo, useDeferredValue, useState} from 'react';
import {keepPreviousData, useQuery} from '@tanstack/react-query';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';
import {Button, Callout, Card, TextField} from '@monorepo-playground/design-system';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {escapeRegExp} from 'es-toolkit';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './page.module.scss';

export default function SearchPage() {
  return (
    <div className={styles.page}>
      <Header />
      <SearchForm />
    </div>
  );
}

function Header() {
  return (
    <div className={styles.section}>
      <h2 className={clsx(typography.h2, styles.heading)}>검색결과 목록 Best Practice</h2>
    </div>
  );
}

function SearchForm() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <div className={styles.searchField}>
        <TextField
          autoFocus
          leading={<MagnifyingGlassIcon />}
          placeholder="검색어를 입력하세요."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <SearchResults query={deferredQuery} />
        </ErrorBoundary>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- memo로 감싼 컴포넌트는 JSX 사용을 위해 PascalCase 변수가 필수
const SearchResults = memo(function SearchResults({query}: {query: string}) {
  const {data: results = [], isPlaceholderData} = useQuery({
    queryKey: ['search', query],
    queryFn: () => getSearchResultsApi(query),
    placeholderData: keepPreviousData,
    retry: 0,
    throwOnError: true,
  });

  if (query !== '' && results.length === 0 && !isPlaceholderData) {
    return <p className={clsx(typography.body1, styles.empty)}>검색결과가 없습니다.</p>;
  }

  return (
    <div>
      {results.map((result, index) => (
        <Card key={index} className={styles.resultCard}>
          <p className={typography.body1}>
            <Highlight query={query} text={result} />
          </p>
        </Card>
      ))}
    </div>
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
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className={clsx(typography.body1, styles.highlight)}>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function ErrorFallback({resetErrorBoundary}: FallbackProps) {
  return (
    <Callout color="danger">
      검색 중 오류가 발생했습니다.{' '}
      <Button size="small" variant="outlined" onClick={resetErrorBoundary}>
        다시 시도
      </Button>
    </Callout>
  );
}

const SIMULATED_DELAY_MS = 200;
