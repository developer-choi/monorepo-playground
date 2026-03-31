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
        <Text as="p" color="gray" size="2" mt="2">
          1. 페이지 진입 시<br />
          2. 다른 탭이나 다른 앱을 갔다가 돌아왔을 때
        </Text>
        <Text as="p" color="gray" size="3" mt="2">
          이를 통해 입력 필드를 클릭하거나 터치하는 한 단계를 생략할 수 있습니다.
          <br />
          이런 작은 불편함을 줄여주는 것이 좋은 UX 중 하나라고 생각합니다.
        </Text>
      </Box>

      <AutoFocusDemo />

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
