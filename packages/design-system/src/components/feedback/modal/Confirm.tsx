import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button from '@/components/inputs/Button';

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
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button color="secondary" size="large" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button color={destructive ? 'destructive' : 'primary'} size="large" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Dialog.Footer>
    </Dialog.Root>
  );
}
