import {Box, Callout, Container, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import ValidationModeDemo from './ValidationModeDemo';
import SubmitButtonDemo from './SubmitButtonDemo';
import ErrorScrollDemo from './ErrorScrollDemo';
import FormLevelErrorDemo from './FormLevelErrorDemo';

export default async function ErrorFeedbackPage() {
  const [modeCodeHtml, submitCodeHtml, scrollCodeHtml, formErrorCodeHtml] = await Promise.all([
    codeToHtml(MODE_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(SUBMIT_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(SCROLL_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(FORM_ERROR_CODE, {lang: 'tsx', theme: 'github-light'}),
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
        <Heading size="5" mb="2">1. Validation Mode</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          react-hook-form의 <code>useForm()</code>은 <code>mode</code> 옵션으로 에러 노출 시점을 결정합니다.
        </Text>
        <Box mb="4">
          <div dangerouslySetInnerHTML={{__html: modeCodeHtml}} />
        </Box>
        <ValidationModeDemo />
        <Box mt="6">
          <Heading size="4" mb="3">왜 onSubmit인가</Heading>
          <Text as="p" size="2" mb="3">
            <strong>onChange의 문제:</strong> 이메일을 입력하는 도중에 &quot;올바른 이메일 형식이 아닙니다&quot;가 바로 나타납니다.
            사용자는 아직 입력을 다 안 한 것뿐이고, 본인도 이메일을 덜 쓴 걸 알고 있습니다.
            이 시점에 에러를 보여주는 건 불필요한 압박입니다.
          </Text>
          <Text as="p" size="2" mb="3">
            <strong>onBlur의 문제:</strong> 포커스가 빠지는 건 의도적인 행동이 아닐 때가 많습니다.
            마우스를 잘못 클릭하거나 다른 곳을 터치해도 포커스는 빠집니다.
            onChange와 마찬가지로, 입력이 끝나지 않은 시점에 에러를 보여줄 수 있습니다.
          </Text>
          <Text as="p" size="2" mb="3">
            <strong>onSubmit 선택 이유:</strong> 제출 버튼을 누르는 건 사용자 스스로
            &quot;이 폼은 다 채웠다&quot;고 판단한 시점입니다. 이때 비로소 에러를 보여주는 게 가장 자연스럽습니다.
          </Text>
          <Text as="p" size="2" mb="3">
            <strong>그렇다고 onSubmit에 단점이 없는 건 아닙니다.</strong> 폼 요소가 많아 스크롤이 필요한 경우,
            제출 버튼은 하단에 있고 에러 필드는 상단에 있을 수 있습니다.
            제출 후 시선이 다시 위로 올라가야 합니다.
            focus + scrollIntoView로 완화할 수 있지만(섹션 3 참고),
            onBlur/onChange는 필드를 하나하나 완벽하게 채우고 다음으로 넘어가므로 이런 문제가 원천적으로 없습니다.
          </Text>
          <Text as="p" size="2" color="gray">
            참고로 네이버 회원가입 폼도 onBlur와 유사하게 동작합니다.
            어떤 모드가 맞는지는 폼의 복잡도와 사용 맥락에 따라 달라집니다.
          </Text>
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
          제출 시 첫 번째 에러 필드로 자동 포커스합니다.
          긴 폼에서 에러 필드가 화면 밖에 있으면 스크롤도 함께 처리해야 합니다.
        </Text>
        <ErrorScrollDemo />
        <Box mt="4">
          <div dangerouslySetInnerHTML={{__html: scrollCodeHtml}} />
        </Box>
      </Box>

      <Box mb="8">
        <Heading size="5" mb="2">4. 폼 전체 에러 vs 필드별 에러</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          필드별 에러는 해당 필드 아래에, API 에러 등 폼 전체 에러는 폼 상단에 표시합니다.
        </Text>
        <FormLevelErrorDemo />
        <Box mt="4">
          <div dangerouslySetInnerHTML={{__html: formErrorCodeHtml}} />
        </Box>
      </Box>

      <Callout.Root color="blue">
        <Callout.Text>
          <strong>추천 조합:</strong> mode: &apos;onSubmit&apos; + reValidateMode: &apos;onChange&apos; (둘 다 기본값).
          제출 전까지 에러를 보여주지 않아 편안한 입력 경험을 제공하되,
          에러 발생 후에는 수정할 때마다 즉시 피드백합니다.
        </Callout.Text>
      </Callout.Root>
    </Container>
  );
}

const MODE_CODE = `// react-hook-form
const { register, handleSubmit } = useForm({
  mode: 'onSubmit', // 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'
});`;

const SUBMIT_CODE = `// ❌ isValid로 버튼 비활성화
<Button disabled={!formState.isValid}>제출</Button>

// ✅ 항상 활성화 — 제출 시 에러 피드백으로 안내
<Button type="submit">제출</Button>`;

const SCROLL_CODE = `// react-hook-form은 기본적으로 첫 번째 에러 필드에 focus
const form = useForm({
  shouldFocusError: true, // 기본값
});

// 화면 밖 에러 필드로 스크롤까지 필요하면
handleSubmit(onValid, (errors) => {
  const firstErrorField = Object.keys(errors)[0];
  const el = document.querySelector(\`[name="\${firstErrorField}"]\`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el?.focus();
});`;

const FORM_ERROR_CODE = `// 폼 전체 에러: setError('root', ...) 사용
const onSubmit = handleSubmit(async (data) => {
  const result = await api.signup(data);

  if (result.error) {
    // 'root'는 특정 필드가 아닌 폼 전체에 대한 에러
    setError('root', { message: result.error });
    return;
  }
});

// JSX에서 root 에러 표시
{errors.root && (
  <Callout.Root color="red">
    <Callout.Text>{errors.root.message}</Callout.Text>
  </Callout.Root>
)}`;
