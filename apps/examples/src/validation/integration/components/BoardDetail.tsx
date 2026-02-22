'use client';

import {useMutation} from '@tanstack/react-query';
import {Container, Heading, Text, Card, Flex, Button, Badge, Separator, AlertDialog} from '@radix-ui/themes';
import {useRouter} from 'next/navigation';
import {deleteBoardApi} from '@/validation/integration/api';
import {isMutationSettling} from '@/shared/query/mutation';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {type BoardDetail, BOARD_TYPES, BOARD_CATEGORIES} from '@/validation/integration/schema';

interface BoardDetailProps {
  board: BoardDetail;
}

export default function BoardDetail({board}: BoardDetailProps) {
  const router = useRouter();

  const handleClientSideError = useHandleClientSideError();
  const deleteMutation = useMutation({mutationFn: deleteBoardApi});

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(board.id);
      await revalidatePathFromClient('/validation/integration');
      router.push('/validation/integration');
    } catch (error) {
      handleClientSideError(error);
    }
  };

  return (
    <Container size="2" p="6">
      <Card size="3">
        <Heading size="6" mb="3">{board.postTitle}</Heading>

        <Flex gap="2" mb="4" wrap="wrap">
          <Badge size="2">{BOARD_TYPES.record[board.boardType]}</Badge>
          <Badge size="2" variant="surface">{BOARD_CATEGORIES.record[board.category]}</Badge>
          {board.tagList.map(tag => (
            <Badge key={tag} size="2" variant="soft">{tag}</Badge>
          ))}
        </Flex>

        <Separator size="4" mb="4" />

        <Text as="p" size="3" style={{whiteSpace: 'pre-wrap', lineHeight: 1.8}} mb="6">
          {board.postContent}
        </Text>

        <Separator size="4" mb="4" />

        <Flex justify="between" align="center">
          <Button variant="soft" color="gray" size="2" onClick={() => router.push('/validation/integration')}>목록으로</Button>
          <Flex gap="2">
            <Button size="2" onClick={() => router.push(`/validation/integration/${board.id}/edit`)}>수정</Button>
            <AlertDialog.Root>
              <AlertDialog.Trigger>
                <Button size="2" color="red" variant="soft" loading={isMutationSettling(deleteMutation)}>삭제</Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content maxWidth="450px">
                <AlertDialog.Title>게시글 삭제</AlertDialog.Title>
                <AlertDialog.Description size="2">
                  정말 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.
                </AlertDialog.Description>
                <Flex gap="3" justify="end" mt="4">
                  <AlertDialog.Cancel>
                    <Button size="2" variant="soft" color="gray">취소</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action>
                    <Button size="2" color="red" onClick={handleDelete}>삭제</Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          </Flex>
        </Flex>
      </Card>
    </Container>
  );
}
