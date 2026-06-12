'use client';

import {useMutation} from '@tanstack/react-query';
import clsx from 'clsx';
import {overlay} from 'overlay-kit';
import {Badge, Button, Card, Confirm} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import {useRouter} from 'next/navigation';
import {deleteBoardApi} from '@/validation/integration/api';
import {isMutationSettling} from '@/shared/query/mutation';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {type BoardDetail, BOARD_TYPES, BOARD_CATEGORIES} from '@/validation/integration/schema';
import styles from './BoardDetail.module.scss';

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

  const handleDeleteClick = async () => {
    const confirmed = await overlay.openAsync<boolean>(({isOpen, close}) => (
      <Confirm
        destructive
        confirmText="삭제"
        content="정말 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        open={isOpen}
        title="게시글 삭제"
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    ));

    if (confirmed) {
      await handleDelete();
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <h2 className={clsx(typography.h2, styles.title)}>{board.postTitle}</h2>

        <div className={styles.badges}>
          <Badge>{BOARD_TYPES.record[board.boardType]}</Badge>
          <Badge variant="surface">{BOARD_CATEGORIES.record[board.category]}</Badge>
          {board.tagList.map((tag) => (
            <Badge key={tag} variant="soft">
              {tag}
            </Badge>
          ))}
        </div>

        <p className={clsx(typography.body1, styles.content)}>{board.postContent}</p>

        <div className={styles.actions}>
          <Button
            color="secondary"
            size="medium"
            variant="outlined"
            onClick={() => router.push('/validation/integration')}
          >
            목록으로
          </Button>
          <div className={styles.actionGroup}>
            <Button size="medium" onClick={() => router.push(`/validation/integration/${board.id}/edit`)}>
              수정
            </Button>
            <Button
              color="destructive"
              loading={isMutationSettling(deleteMutation)}
              size="medium"
              variant="outlined"
              onClick={() => void handleDeleteClick()}
            >
              삭제
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
