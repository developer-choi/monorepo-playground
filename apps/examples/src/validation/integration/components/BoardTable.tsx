'use client';

import {Badge, Table} from '@monorepo-playground/design-system';
import clsx from 'clsx';
import {useRouter} from 'next/navigation';
import typography from '@monorepo-playground/design-system/styles/typography';
import {BoardListApiResponse, BOARD_TYPES, BOARD_CATEGORIES} from '@/validation/integration/schema';
import Pagination from '@/shared/components/Pagination';
import styles from './BoardTable.module.scss';

interface BoardTableProps {
  data: BoardListApiResponse;
}

export default function BoardTable({data}: BoardTableProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(location.search);
    next.set('page', page.toString());
    router.push(`/validation/integration?${next.toString()}`);
  };

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width={60}>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={80}>타입</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={100}>카테고리</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>태그</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.list.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <p className={clsx(typography.body1, styles.empty)}>게시글이 없습니다.</p>
              </Table.Cell>
            </Table.Row>
          )}
          {data.list.map((row) => (
            <Table.Row
              key={row.id}
              className={styles.clickableRow}
              onClick={() => router.push(`/validation/integration/${row.id}`)}
            >
              <Table.Cell>{row.id}</Table.Cell>
              <Table.Cell>{row.postTitle}</Table.Cell>
              <Table.Cell>
                <Badge variant="soft">{BOARD_TYPES.record[row.boardType]}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge>{BOARD_CATEGORIES.record[row.category]}</Badge>
              </Table.Cell>
              <Table.Cell>
                <div className={styles.tags}>
                  {row.tagList.map((tag) => (
                    <Badge key={tag} size="small" variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <div className={styles.pagination}>
        <Pagination
          page={data.paginationMeta.page}
          totalPages={data.paginationMeta.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
