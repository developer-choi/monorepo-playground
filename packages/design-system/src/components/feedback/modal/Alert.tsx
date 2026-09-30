import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button from '@/components/inputs/Button';

export interface AlertProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  confirmText?: string;
}

export default function Alert({open, onClose, title, content, confirmText = '확인'}: AlertProps) {
  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button size="large" onClick={onClose}>
          {confirmText}
        </Button>
      </Dialog.Footer>
    </Dialog.Root>
  );
}
