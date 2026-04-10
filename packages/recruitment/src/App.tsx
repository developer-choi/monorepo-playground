import AppProvider from './setting/AppProvider.tsx';
import LoadingPage from '@/components/LoadingPage.tsx';
import EmptyContent from '@/components/EmptyContent.tsx';
import {ErrorPageTemplate, HandledErrorBoundary} from '@/components/error.tsx';
import Alert from '@/components/Alert.tsx';
import Confirm from '@/components/Confirm.tsx';
import {Flex, Button, Heading, Section, Container, Box} from '@radix-ui/themes';
import {InfoCircledIcon} from '@radix-ui/react-icons';
import {overlay} from 'overlay-kit';
import {useState} from 'react';

export default function App() {
  const openAlert = () => {
    overlay.open(({unmount}) => <Alert content="알림 메시지입니다." title="Alert 제목" onConfirm={unmount} />);
  };

  const openConfirm = () => {
    overlay.open(({unmount}) => (
      <Confirm content="진행하시겠습니까?" title="Confirm 제목" onCancel={unmount} onConfirm={unmount} />
    ));
  };

  return (
    <AppProvider>
      <Container size="2">
        <Flex direction="column" gap="6" p="4">
          <Section>
            <Heading mb="4">Loading Page</Heading>
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. CSS Module 파일 생성 검토 필요 */}
            <Box height="100px" position="relative" style={{border: '1px solid var(--gray-5)'}}>
              <LoadingPage />
            </Box>
          </Section>

          <Section>
            <Heading mb="4">Empty Content</Heading>
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. CSS Module 파일 생성 검토 필요 */}
            <Box height="100px" style={{border: '1px solid var(--gray-5)'}}>
              <EmptyContent
                content="데이터가 존재하지 않습니다."
                icon={<InfoCircledIcon color="gray" height="24" width="24" />}
              />
            </Box>
          </Section>

          <Section>
            <Heading mb="4">Error Page Template</Heading>
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. CSS Module 파일 생성 검토 필요 */}
            <Box height="300px" style={{border: '1px solid var(--gray-5)'}}>
              <ErrorPageTemplate
                action={{text: '다시 시도', onClick: () => alert('Retry')}}
                content="오류가 발생했습니다."
              />
            </Box>
          </Section>

          <Section>
            <Heading mb="4">Handled Error Boundary</Heading>
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS 변수 참조라 정적 CSS Module로 분리 불가. CSS Module 파일 생성 검토 필요 */}
            <Box height="300px" style={{border: '1px solid var(--gray-5)'}}>
              <HandledErrorBoundary>
                <BuggyComponent />
              </HandledErrorBoundary>
            </Box>
          </Section>

          <Section>
            <Heading mb="4">Dialogs</Heading>
            <Flex gap="3">
              <Button onClick={openAlert}>Open Alert</Button>
              <Button onClick={openConfirm}>Open Confirm</Button>
            </Flex>
          </Section>
        </Flex>
      </Container>
    </AppProvider>
  );
}

function BuggyComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('일반 에러 발생!');
  }

  return (
    <Flex align="center" height="100%" justify="center">
      <Button color="red" onClick={() => setShouldError(true)}>
        에러 발생시키기
      </Button>
    </Flex>
  );
}
