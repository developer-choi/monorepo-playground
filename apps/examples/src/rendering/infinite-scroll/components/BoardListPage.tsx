'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { boardQueries } from '../queries';
import BoardCard from './BoardCard';
import BoardCardSkeleton from './BoardCardSkeleton';
import ErrorPageTemplate from '@/shared/components/ErrorPageTemplate';
import styles from './BoardListPage.module.scss';
import { Button } from '@radix-ui/themes';

export default function BoardListPage() {
  const { data } = useSuspenseQuery(boardQueries.list.options());

  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorPageTemplate
          message="게시글 목록을 불러오지 못했습니다."
          action={<Button onClick={resetErrorBoundary}>다시 시도</Button>}
        />
      )}
    >
      <section className={styles.container}>
        <div className={styles.grid}>
          {data.list.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      </section>
    </ErrorBoundary>
  );
}

export function BoardListSkeleton() {
  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <BoardCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

const SKELETON_COUNT = 24;
