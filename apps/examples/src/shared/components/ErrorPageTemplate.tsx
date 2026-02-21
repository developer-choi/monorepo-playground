import {Container, Flex, Heading, Text} from '@radix-ui/themes';

interface ErrorPageTemplateProps {
  message: string;
}

export default function ErrorPageTemplate({message}: ErrorPageTemplateProps) {
  return (
    <Container size="2" p="6">
      <Flex direction="column" align="center" justify="center" gap="3" py="9">
        <Heading size="6" color="red">오류가 발생했습니다</Heading>
        <Text size="3" color="gray">{message}</Text>
      </Flex>
    </Container>
  );
}
