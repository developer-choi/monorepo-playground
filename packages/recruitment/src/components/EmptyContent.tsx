import {Flex, Text} from '@radix-ui/themes';
import type {ReactNode} from 'react';

export interface EmptyContentProps {
  icon: ReactNode;
  content: string;
}

export default function EmptyContent({icon, content}: EmptyContentProps) {
  return (
    <Flex direction="column" align="center" justify="center" gap="2">
      {icon}
      <Text color="gray">{content}</Text>
    </Flex>
  );
}