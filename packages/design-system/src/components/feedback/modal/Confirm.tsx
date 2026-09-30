import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button from '@/components/inputs/Button';

export interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  content: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

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
