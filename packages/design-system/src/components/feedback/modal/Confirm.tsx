import {type ReactNode} from 'react';
import * as Dialog from './Dialog';
import Button, {type ButtonProps} from '@/components/inputs/Button';

type ActionButtonProps = Omit<ButtonProps, 'onClick'>;

export interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  content: ReactNode;
  confirmProps?: ActionButtonProps;
  cancelProps?: ActionButtonProps;
}

const DEFAULT_CONFIRM_PROPS: ActionButtonProps = {children: '확인', color: 'primary', size: 'large'};
const DEFAULT_CANCEL_PROPS: ActionButtonProps = {children: '취소', color: 'secondary', size: 'large'};

export default function Confirm({open, onConfirm, onCancel, title, content, confirmProps, cancelProps}: ConfirmProps) {
  const loading = confirmProps?.loading ?? false;
  const mergedCancelProps = {...DEFAULT_CANCEL_PROPS, ...cancelProps};

  return (
    <Dialog.Root disableBackdropClick={loading} disableEscapeKeyDown={loading} open={open} onClose={onCancel}>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content>{content}</Dialog.Content>
      <Dialog.Footer>
        <Button {...mergedCancelProps} disabled={loading || mergedCancelProps.disabled} onClick={onCancel} />
        <Button {...DEFAULT_CONFIRM_PROPS} {...confirmProps} onClick={onConfirm} />
      </Dialog.Footer>
    </Dialog.Root>
  );
}
