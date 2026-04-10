import {Container, Flex, Heading, Text} from '@radix-ui/themes';
import {type ReactNode} from 'react';

interface ErrorPageTemplateProps {
  message: string;
  action?: ReactNode;
}

export default function ErrorPageTemplate({message, action}: ErrorPageTemplateProps) {
  return (
    <Container p="6" size="2">
      <Flex align="center" direction="column" gap="3" justify="center" py="9">
        <Heading color="red" size="6">
          오류가 발생했습니다
        </Heading>
        <Text color="gray" size="3">
          {message}
        </Text>
        {action}
      </Flex>
    </Container>
  );
}
