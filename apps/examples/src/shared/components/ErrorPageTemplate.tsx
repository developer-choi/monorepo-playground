import {Container, Flex, Heading, Text} from '@radix-ui/themes';
import {Button} from '@monorepo-playground/design-system';

interface ErrorPageTemplateProps {
  title: string;
  content: string;
  onAction?: () => void;
}

export default function ErrorPageTemplate({title, content, onAction}: ErrorPageTemplateProps) {
  return (
    <Container p="6" size="2">
      <Flex align="center" direction="column" gap="3" justify="center" py="9">
        <Heading color="red" size="6">
          {title}
        </Heading>
        <Text color="gray" size="3">
          {content}
        </Text>
        {onAction && <Button onClick={onAction}>다시 시도</Button>}
      </Flex>
    </Container>
  );
}
