import {Flex, Text} from '@radix-ui/themes';
import type {ReactNode} from 'react';

export interface EmptyContentProps {
  icon: ReactNode;
  content: string;
}

export default function EmptyContent({icon, content}: EmptyContentProps) {
  return (
    <Flex align="center" direction="column" gap="2" justify="center">
      {icon}
      <Text color="gray">{content}</Text>
    </Flex>
  );
}
