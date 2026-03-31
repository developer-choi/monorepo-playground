import {Box, Callout, Container, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import AutoFocusDemo from './AutoFocusDemo';

export default async function AutoFocusPage() {
  const autoFocusHtml = await codeToHtml(AUTO_FOCUS_CODE, {lang: 'tsx', theme: 'github-light'});
  const hookHtml = await codeToHtml(HOOK_CODE, {lang: 'tsx', theme: 'github-light'});

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="7" mb="2">Auto Focus</Heading>
        <Text as="p" color="gray" size="3">
          단일 목적 페이지에서는 주요 입력 필드에 자동 포커스를 설정합니다.
        </Text>
      </Box>

      <AutoFocusDemo />

      <Box mb="6">
        <Heading size="5" mb="4">목적</Heading>
        <Text as="p" color="gray" size="3">
          사용자가 입력 필드를 마우스로 클릭하거나 모바일에서 터치하는 한 단계를 줄여줍니다.
          <br />
          페이지에 진입하자마자 바로 타이핑할 수 있는 것이 좋은 UX라고 생각합니다.
        </Text>
      </Box>

      <Box mb="6">
        <Heading size="5" mb="4">1. HTML autoFocus 속성</Heading>
        <Text as="p" color="gray" size="2" mb="2">
          페이지 로드 시 자동으로 포커스됩니다.
        </Text>
        <div dangerouslySetInnerHTML={{__html: autoFocusHtml}} />
      </Box>

      <Box mb="6">
        <Heading size="5" mb="4">2. 윈도우 포커스 시 재포커스</Heading>
        <Text as="p" color="gray" size="2" mb="2">
          탭을 전환했다가 돌아오면 autoFocus가 있는 요소에 다시 포커스합니다.
        </Text>
        <div dangerouslySetInnerHTML={{__html: hookHtml}} />
      </Box>

      <Callout.Root color="blue">
        <Callout.Text>
          <strong>주의:</strong> autoFocus는 검색, 로그인 등 단일 목적 페이지에서만 사용하세요.
          여러 콘텐츠가 있는 페이지에서는 사용자가 의도하지 않은 위치로 스크롤될 수 있습니다.
        </Callout.Text>
      </Callout.Root>
    </Container>
  );
}

const AUTO_FOCUS_CODE = `<Input placeholder="검색어를 입력하세요" autoFocus />`;

const HOOK_CODE = `useEffect(() => {
  function handleFocus() {
    const element = document.querySelector<HTMLElement>('[autofocus]');
    element?.focus();
  }

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);`;
