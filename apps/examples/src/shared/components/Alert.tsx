import {AlertDialog, Flex} from '@radix-ui/themes';
import {Button} from '@monorepo-playground/design-system';

interface AlertProps {
  title: string;
  content: string;
  onClose: () => void;
}

export default function Alert({title, content, onClose}: AlertProps) {
  return (
    <AlertDialog.Root
      open
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{content}</AlertDialog.Description>
        <Flex gap="3" justify="end" mt="4">
          <AlertDialog.Action>
            <Button onClick={onClose}>확인</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
