'use client';

import {ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons';
import clsx from 'clsx';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './Pagination.module.scss';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({page, totalPages, onPageChange}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <Button disabled={page <= 1} size="small" variant="outlined" onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon />
      </Button>

      {getPageNumbers(page, totalPages).map((pageNum, index) =>
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} className={clsx(typography.body2, styles.ellipsis)}>
            ...
          </span>
        ) : (
          <Button
            key={pageNum}
            size="small"
            variant={pageNum === page ? 'contained' : 'outlined'}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ),
      )}

      <Button disabled={page >= totalPages} size="small" variant="outlined" onClick={() => onPageChange(page + 1)}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= MAX_PAGES_NO_ELLIPSIS) {
    const pages: number[] = [];
    for (let num = 1; num <= total; num++) {
      pages.push(num);
    }
    return pages;
  }

  if (current <= PAGES_NEAR_EDGE) {
    return [1, 2, PAGES_NEAR_EDGE, PAGES_NEAR_EDGE_OFFSET, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - PAGES_NEAR_EDGE, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

const MAX_PAGES_NO_ELLIPSIS = 7;
const PAGES_NEAR_EDGE = 3;
const PAGES_NEAR_EDGE_OFFSET = 4;
