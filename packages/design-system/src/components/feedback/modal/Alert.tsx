import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button, {type ButtonProps} from '@/components/inputs/Button';

export interface AlertProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  confirmProps?: Omit<ButtonProps, 'onClick'>;
}

const DEFAULT_CONFIRM_PROPS: Omit<ButtonProps, 'onClick'> = {children: '확인', color: 'primary', size: 'large'};

export default function Alert({open, onClose, title, content, confirmProps}: AlertProps) {
  return (
    <Dialog.Root open={open} onClose={onClose}>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button {...DEFAULT_CONFIRM_PROPS} {...confirmProps} onClick={onClose} />
      </Dialog.Footer>
    </Dialog.Root>
  );
}
