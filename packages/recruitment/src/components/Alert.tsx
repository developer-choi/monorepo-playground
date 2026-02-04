import {AlertDialog, Button, Flex} from '@radix-ui/themes';
import type {MouseEventHandler} from 'react';

export interface AlertProps {
  title: string;
  content: string;
  onConfirm: MouseEventHandler<HTMLButtonElement>;
}

export default function Alert({title, content, onConfirm}: AlertProps) {
  return (
    <AlertDialog.Root open>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {content}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Action>
            <Button autoFocus variant="solid" onClick={onConfirm}>
              확인
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}