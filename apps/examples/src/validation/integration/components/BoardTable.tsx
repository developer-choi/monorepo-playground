'use client';

import {Table, Badge, Flex, Text} from '@radix-ui/themes';
import {useRouter} from 'next/navigation';
import {BoardListApiResponse, BOARD_TYPES, BOARD_CATEGORIES} from '@/validation/integration/schema';
import Pagination from '@/shared/components/Pagination';

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
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width="60">ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>제목</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="80">타입</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width="80">카테고리</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>태그</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.list.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <Text color="gray" align="center">게시글이 없습니다.</Text>
              </Table.Cell>
            </Table.Row>
          )}
          {data.list.map(row => (
            <Table.Row
              key={row.id}
              style={{cursor: 'pointer'}}
              onClick={() => router.push(`/validation/integration/${row.id}`)}
            >
              <Table.Cell>{row.id}</Table.Cell>
              <Table.Cell>{row.postTitle}</Table.Cell>
              <Table.Cell>
                <Badge variant="soft">
                  {BOARD_TYPES.record[row.boardType]}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="surface">
                  {BOARD_CATEGORIES.record[row.category]}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Flex gap="1" wrap="wrap">
                  {row.tagList.map(tag => (
                    <Badge key={tag} variant="outline" size="1">{tag}</Badge>
                  ))}
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justify="center" mt="4">
        <Pagination
          page={data.paginationMeta.page}
          totalPages={data.paginationMeta.totalPages}
          onPageChange={handlePageChange}
        />
      </Flex>
    </>
  );
}
