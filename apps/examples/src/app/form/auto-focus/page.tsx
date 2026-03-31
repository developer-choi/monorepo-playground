import {Box, Callout, Container, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import AutoFocusDemo from './AutoFocusDemo';

export default async function AutoFocusPage() {
  const [autoFocusHtml, hookHtml] = await Promise.all([
    codeToHtml(AUTO_FOCUS_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(HOOK_CODE, {lang: 'tsx', theme: 'github-light'}),
  ]);

  return (
    <Container p="6" size="4">
      <Box mb="6">
        <Heading mb="2" size="7">
          Auto Focus
        </Heading>
        <Text as="p" color="gray" size="3">
          폼이 페이지의 주된 목적인 곳에서는 첫 폼 요소에 <code>autoFocus</code>를 걸어 사용자가 진입 직후 바로 입력을
          시작할 수 있게 합니다.
        </Text>
        <Text as="p" color="gray" mt="2" size="3">
          클릭·터치 한 단계를 생략하는 작은 UX입니다.
        </Text>
      </Box>

      <AutoFocusDemo />

      <Box mb="6">
        <Heading mb="4" size="5">
          1. 적용 기준
        </Heading>
        <Text as="p" color="gray" mb="2" size="2">
          <strong>✅ 폼 중심 페이지</strong> — 로그인, 회원가입, 게시글 쓰기, 검색 전용 페이지 등. 다중 필드 폼이어도 첫
          필드에만 걸면 충분합니다.
        </Text>
        <Text as="p" color="gray" mb="2" size="2">
          <strong>❌ 콘텐츠를 스크롤로 소비하는 페이지</strong> — 검색 결과, 피드, 기사 + 하단 댓글 폼 등. 재진입 시
          복원된 스크롤을 input 포커스가 가로채 탐색 흐름이 깨집니다.
        </Text>
      </Box>

      <Box mb="6">
        <Heading mb="4" size="5">
          2. HTML autoFocus 속성
        </Heading>
        <Text as="p" color="gray" mb="2" size="2">
          HTML 표준 속성 하나로 끝납니다. 별도 구현이 필요 없습니다.
        </Text>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        <div dangerouslySetInnerHTML={{__html: autoFocusHtml}} />
      </Box>

      <Callout.Root color="orange">
        <Heading mb="2" size="4">
          실험 중 — 탭 복귀 시 재포커스
        </Heading>
        <Callout.Text>
          다른 탭/앱에 갔다가 돌아왔을 때도 해당 input에 다시 포커스를 주면 더 편할 것 같아 시도해봤습니다. window의{' '}
          <code>focus</code> 이벤트에서 <code>[autofocus]</code> 요소를 재포커스하는 방식이고, 이 페이지 상단 데모에서
          실제로 동작합니다.
        </Callout.Text>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        <div dangerouslySetInnerHTML={{__html: hookHtml}} />
        <Heading mb="2" mt="4" size="3">
          발견한 엣지 케이스
        </Heading>
        <Callout.Text>
          • 로그인처럼 여러 필드가 있는 폼에서 password 필드로 이동한 뒤 다른 탭에 다녀오면, 포커스가 첫 필드인 email로
          되돌아가 사용자가 진행하던 위치를 잃습니다.
        </Callout.Text>
        <Callout.Text>
          • 검색 결과 페이지처럼 스크롤로 소비하는 곳에서는 다른 탭에 다녀왔을 때 스크롤이 input 위치로 튑니다.
        </Callout.Text>
        <Heading mb="2" mt="4" size="3">
          좁힌 적용 조건
        </Heading>
        <Callout.Text>아래를 모두 충족할 때만 재포커스:</Callout.Text>
        <Callout.Text>
          • 페이지 내 <code>[autofocus]</code> 요소가 1개
        </Callout.Text>
        <Callout.Text>
          • 그 요소의 부모 <code>&lt;form&gt;</code> 안에 <code>&lt;input&gt;</code> / <code>&lt;textarea&gt;</code> 총
          갯수가 1개
        </Callout.Text>
        <Callout.Text>• 복귀 시점의 스크롤이 최상단</Callout.Text>
        <Callout.Text>
          그럼에도 아직 고려하지 못한 다른 엣지 케이스가 있을 것 같아, 실제 프로덕션 도입은 보류 중입니다.
        </Callout.Text>
      </Callout.Root>
    </Container>
  );
}

const AUTO_FOCUS_CODE = `<form>
  <Input autoFocus placeholder="이메일" />
  <Input placeholder="비밀번호" type="password" />
  <button type="submit">로그인</button>
</form>`;

const HOOK_CODE = `useEffect(() => {
  function handleFocus() {
    const element = document.querySelector<HTMLElement>('[autofocus]');
    element?.focus();
  }

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, []);`;
