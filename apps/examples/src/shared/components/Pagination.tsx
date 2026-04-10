'use client';

import {Button, Flex, Text} from '@radix-ui/themes';
import {ChevronLeftIcon, ChevronRightIcon} from '@radix-ui/react-icons';

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
    <Flex align="center" gap="1">
      <Button variant="soft" size="1" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon />
      </Button>

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === '...' ? (
          <Text key={`ellipsis-${i}`} size="2" color="gray" mx="1">
            ...
          </Text>
        ) : (
          <Button key={p} variant={p === page ? 'solid' : 'soft'} size="1" onClick={() => onPageChange(p)}>
            {p}
          </Button>
        ),
      )}

      <Button variant="soft" size="1" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRightIcon />
      </Button>
    </Flex>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= MAX_PAGES_NO_ELLIPSIS) {
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
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
