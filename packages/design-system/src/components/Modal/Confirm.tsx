import {type ReactNode} from 'react';
import clsx from 'clsx';
import * as Dialog from './Dialog';
import Button from '@/components/Button';
import styles from './Confirm.module.scss';

export interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  content: ReactNode;
  /** 확인 버튼 라벨. 기본값 '확인' */
  confirmText?: string;
  /** 취소 버튼 라벨. 기본값 '취소' */
  cancelText?: string;
  /** true이면 확인 버튼을 파괴적(빨강)으로, 제목을 destructive 색으로 표시한다. */
  destructive?: boolean;
}

/**
 * 취소·확인 2버튼 확인 모달. 결과값(확인/취소)을 받아야 할 때 사용한다.
 * controlled(open/onConfirm/onCancel)이며, 소비자는 overlay.openAsync<boolean>로
 * close(true)/close(false)를 연결해 결과를 await한다.
 */
export default function Confirm({
  open,
  onConfirm,
  onCancel,
  title,
  content,
  confirmText = '확인',
  cancelText = '취소',
  destructive = false,
}: ConfirmProps) {
  return (
    <Dialog.Root open={open} onClose={onCancel}>
      <Dialog.Header>
        <Dialog.Title className={clsx(destructive && [styles.criticalTitle, styles.styled])}>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button color="secondary" variant="outlined" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button color={destructive ? 'destructive' : 'primary'} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Dialog.Footer>
    </Dialog.Root>
  );
}
