import {Box, Container, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import ValidationModeDemo from './ValidationModeDemo';
import SubmitButtonDemo from './SubmitButtonDemo';
import ErrorScrollDemo from './ErrorScrollDemo';

export default async function ErrorFeedbackPage() {
  const [modeCodeHtml, submitCodeHtml, scrollCodeHtml] = await Promise.all([
    codeToHtml(MODE_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(SUBMIT_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(SCROLL_CODE, {lang: 'tsx', theme: 'github-light'}),
  ]);

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="7" mb="2">에러 피드백</Heading>
        <Text as="p" color="gray" size="3">
          폼 에러를 사용자에게 <strong>언제, 어디서, 어떻게</strong> 보여줄 것인가에 대한 패턴입니다.
        </Text>
      </Box>

      <Box mb="8">
        <Heading size="5" mb="2">1. 유효성검증은 언제 해야 하는가?</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          에러를 보여주는 시점은 크게 세 가지입니다: <strong>입력 시점</strong>, <strong>포커스가 빠진 시점</strong>, <strong>제출 시점</strong>.
        </Text>
        <Box mb="6">
          <Text as="p" size="2" mb="3">
            <strong>입력 시점</strong> — 입력 도중에 에러가 바로 나타납니다.
            사용자도 이메일을 덜 쓴 걸 알고 있는데, 이 시점에 에러를 보여주는 건 불필요한 압박입니다.
          </Text>
          <Text as="p" size="2" mb="3">
            <strong>포커스가 빠진 시점</strong> — 포커스는 의도와 무관하게 빠질 때가 많습니다.
            마우스를 잘못 클릭하거나 다른 곳을 터치해도 에러가 뜹니다.
          </Text>
          <Text as="p" size="2" mb="3">
            <strong>제출 시점</strong> — 제출 버튼을 누르는 건 사용자 스스로
            &quot;다 채웠다&quot;고 판단한 시점입니다. 이때 에러를 보여주는 게 가장 자연스럽습니다.
          </Text>
          <Text as="p" size="2" color="gray">
            <strong>제출 시점의 한계</strong> — 폼이 길면 제출 버튼(하단)과 에러 필드(상단)의 거리가 멀어집니다.
            에러 필드로 자동 포커스하는 것으로 완화할 수 있지만,
            나머지 두 방식은 필드를 하나하나 채워 넘어가므로 이 문제가 원천적으로 없습니다.
          </Text>
        </Box>
        <Text as="p" color="gray" size="2" mb="4">
          react-hook-form의 <code>useForm()</code>은 <code>mode</code> 옵션으로 이 시점을 간편하게 설정할 수 있습니다.
        </Text>
        <ValidationModeDemo />
        <Box mt="4">
          <div dangerouslySetInnerHTML={{__html: modeCodeHtml}} />
        </Box>
      </Box>

      <Box mb="8">
        <Heading size="5" mb="2">2. 제출 버튼은 항상 활성화</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          isValid로 버튼을 비활성화하면 사용자가 뭘 고쳐야 하는지 알 수 없습니다.
          항상 활성화하고, 제출 시 에러 피드백으로 안내하세요.
        </Text>
        <SubmitButtonDemo />
        <Box mt="4">
          <div dangerouslySetInnerHTML={{__html: submitCodeHtml}} />
        </Box>
      </Box>

      <Box mb="8">
        <Heading size="5" mb="2">3. 에러 필드로 포커스 이동</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          react-hook-form은 제출 시 첫 번째 에러 필드로 자동 포커스하고,
          화면 밖에 있으면 스크롤까지 처리해줍니다. 별도 구현 없이 동작하므로 편리합니다.
        </Text>
        <ErrorScrollDemo />
        <Box mt="4">
          <div dangerouslySetInnerHTML={{__html: scrollCodeHtml}} />
        </Box>
      </Box>

    </Container>
  );
}

const MODE_CODE = `// react-hook-form
const { register, handleSubmit } = useForm({
  mode: 'onSubmit', // 'onSubmit' | 'onBlur' | 'onChange'
});`;

const SUBMIT_CODE = `// ❌ isValid로 버튼 비활성화
<Button disabled={!formState.isValid}>제출</Button>

// ✅ 항상 활성화 — 제출 시 에러 피드백으로 안내
<Button type="submit">제출</Button>`;

const SCROLL_CODE = `// react-hook-form은 기본적으로 첫 번째 에러 필드에 focus + scroll
const form = useForm({
  shouldFocusError: true, // 기본값 — 별도 설정 불필요
});`;
