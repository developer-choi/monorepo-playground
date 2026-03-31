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
          mode 설정에 따라 에러 노출 시점이 달라집니다.
          기본값 onSubmit은 제출 전까지 에러를 숨기되, 에러 발생 후에는 수정할 때마다 즉시 재검증합니다 (reValidateMode: &apos;onChange&apos;).
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

const MODE_CODE = `// mode: 에러가 처음 나타나는 시점
// reValidateMode: 에러 발생 후 재검증 시점

const form = useForm({
  mode: 'onSubmit',           // 제출 시 검증 (기본값)
  reValidateMode: 'onChange', // 에러 후 입력마다 재검증 (기본값)
});

// mode 옵션별 동작
// 'onSubmit'  — 제출 버튼을 눌러야 에러 표시
// 'onBlur'    — 필드를 벗어나면 에러 표시
// 'onChange'  — 입력할 때마다 에러 표시
// 'onTouched' — 첫 blur 후부터 onChange처럼 동작
// 'all'       — onBlur + onChange 동시 적용`;

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
