import {Container, Flex} from '@radix-ui/themes';
import clsx from 'clsx';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './ErrorPageTemplate.module.scss';

interface ErrorPageTemplateProps {
  title: string;
  content: string;
  onAction?: () => void;
}

export default function ErrorPageTemplate({title, content, onAction}: ErrorPageTemplateProps) {
  return (
    <Container p="6" size="2">
      <Flex align="center" direction="column" gap="3" justify="center" py="9">
        <h2 className={clsx(typography.h2, styles.title)}>{title}</h2>
        <p className={clsx(typography.body1, styles.content)}>{content}</p>
        {onAction && <Button onClick={onAction}>다시 시도</Button>}
      </Flex>
    </Container>
  );
}
