import {AlertDialog, Button, Flex} from '@radix-ui/themes';
import type {AlertProps} from '@/components/Alert.tsx';
import type {MouseEventHandler} from 'react';

export interface ConfirmProps extends AlertProps {
  onCancel: MouseEventHandler<HTMLButtonElement>;
}

export default function Confirm({title, content, onConfirm, onCancel}: ConfirmProps) {
  return (
    <AlertDialog.Root open>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title || '확인'}</AlertDialog.Title>
        <AlertDialog.Description size="2">{content}</AlertDialog.Description>

        <Flex gap="3" justify="end" mt="4">
          <AlertDialog.Cancel>
            <Button autoFocus color="gray" variant="soft" onClick={onCancel}>
              취소
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" onClick={onConfirm}>
              확인
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
