import {type ReactNode, type MouseEvent, type PropsWithChildren} from 'react';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import {Flex, Text, Button, Link, Box} from '@radix-ui/themes';
import logo from '@/assets/logo.webp';

export interface ErrorPageTemplateProps {
  content: string;
  action:
    | {
        text: ReactNode;
        href: string;
      }
    | {
        text: ReactNode;
        onClick: (event: MouseEvent<HTMLButtonElement>) => void;
      };
}

export function ErrorPageTemplate({content, action}: ErrorPageTemplateProps) {
  return (
    <Flex align="center" direction="column" gap="4" height="100%" justify="center" width="100%">
      <Box mb="2">
        <img alt="Logo" src={logo} />
      </Box>
      <Text align="center" size="5" weight="bold">
        {content}
      </Text>
      {'href' in action ? (
        <Link href={action.href}>
          <Button variant="soft">{action.text}</Button>
        </Link>
      ) : (
        <Button variant="soft" onClick={action.onClick}>
          {action.text}
        </Button>
      )}
    </Flex>
  );
}

export function HandledErrorBoundary({children}: PropsWithChildren) {
  const ErrorFallback = ({error, resetErrorBoundary}: FallbackProps) => {
    if (error instanceof ExampleError) {
      return <ErrorPageTemplate action={{text: '새로고침', onClick: resetErrorBoundary}} content="이런 에러에요" />;
    }

    return <ErrorPageTemplate action={{text: '홈으로 돌아가기', href: '/'}} content="적당한 500에러 메시지" />;
  };

  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
}

class ExampleError extends Error {}
