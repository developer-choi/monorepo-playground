'use client';

import {Table, Badge, Flex, IconButton, Text, AlertDialog, Button} from '@radix-ui/themes';
import {TrashIcon} from '@radix-ui/react-icons';
import {useRouter} from 'next/navigation';
import {useMutation} from '@tanstack/react-query';
import {deleteBoardApi} from '@/validation/integration/api';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {BoardListApiResponse, BOARD_TYPES, BOARD_CATEGORIES} from '@/validation/integration/schema';
import Pagination from '@/shared/components/Pagination';

interface BoardTableProps {
  data: BoardListApiResponse;
}

export default function BoardTable({data}: BoardTableProps) {
  const router = useRouter();

  const handleClientSideError = useHandleClientSideError();
  const deleteMutation = useMutation({mutationFn: deleteBoardApi});

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      await revalidatePathFromClient('/validation/integration');
    } catch (error) {
      handleClientSideError(error);
    }
  };

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
            <Table.ColumnHeaderCell width="60" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.list.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={6}>
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
              <Table.Cell>
                <AlertDialog.Root>
                  <AlertDialog.Trigger>
                    <IconButton
                      variant="ghost"
                      color="red"
                      size="1"
                      onClick={e => e.stopPropagation()}
                    >
                      <TrashIcon />
                    </IconButton>
                  </AlertDialog.Trigger>
                  <AlertDialog.Content maxWidth="450px" onClick={e => e.stopPropagation()}>
                    <AlertDialog.Title>게시글 삭제</AlertDialog.Title>
                    <AlertDialog.Description size="2">
                      &quot;{row.postTitle}&quot;을(를) 삭제하시겠습니까?
                    </AlertDialog.Description>
                    <Flex gap="3" justify="end" mt="4">
                      <AlertDialog.Cancel>
                        <Button size="2" variant="soft" color="gray">취소</Button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action>
                        <Button size="2" color="red" onClick={() => handleDelete(row.id)}>삭제</Button>
                      </AlertDialog.Action>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
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
