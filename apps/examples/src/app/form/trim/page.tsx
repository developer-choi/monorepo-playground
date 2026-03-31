import {Box, Callout, Container, Grid, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import {BadExample, GoodExample} from '@/form/components/example';

export default async function ValidationPage() {
  const [codeHtml, trimObjectCodeHtml] = await Promise.all([
    codeToHtml(SAMPLE_CODE, {lang: 'tsx', theme: 'github-light'}),
    codeToHtml(TRIM_OBJECT_CODE, {lang: 'ts', theme: 'github-light'}),
  ]);

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="7" mb="2">Trim 유효성검증</Heading>
        <Text as="p" color="gray" size="3">
          공백만 입력하면 미입력과 동일하게 취급하고, 제출 시에는 trim된 값을 사용해야 합니다.
          <br />
          <strong>핵심: 폼 데이터는 공백이 포함된 원본 그대로 유지하고, 유효성검증과 trim을 분리 구현합니다.</strong>
        </Text>
      </Box>

      <Grid columns="2" gap="4">
        <BadExample />
        <GoodExample />
      </Grid>

      <Box mt="8" mb="8">
        <Heading size="5" mb="4">왜 유효성검증과 trim을 분리하는가?</Heading>

        <Callout.Root color="orange">
          <Callout.Text>
            <strong>시도: onChange에서 실시간 trim</strong>
          </Callout.Text>
          <div dangerouslySetInnerHTML={{__html: codeHtml}} />
          <Callout.Text>
            &quot;101동&quot; 입력 후 &quot; 105호&quot;를 이어 쓰려고 스페이스바를 누르면 공백이 즉시 제거됩니다.
            <br />
            입력 도중에 값을 가로채면 안 되므로, 폼 데이터는 <code>&apos; 홍길동 &apos;</code>처럼 공백이 포함된 원본 그대로 들고 있어야 합니다.
            유효성검증은 원본값으로 하고, trim은 제출 시점에 수행합니다.
          </Callout.Text>
        </Callout.Root>
      </Box>

      <Box mb="8">
        <Heading size="5" mb="2">3. 서버 전송 시 일괄 trim</Heading>
        <Text as="p" color="gray" size="2" mb="4">
          필드가 하나라면 <code>data.name.trim()</code>으로 충분하지만,
          실무 폼은 필드가 수십 개입니다. 하나하나 trim하는 건 비현실적이므로,
          객체를 재귀 순회하며 모든 문자열을 한번에 trim하는 유틸리티 함수를 만들어 사용합니다.
        </Text>
        <div dangerouslySetInnerHTML={{__html: trimObjectCodeHtml}} />
        <Text as="p" size="2" mt="4">
          <code>trimObject()</code>는 중첩된 객체와 배열도 재귀적으로 순회합니다.
          서버로 보내기 직전에 <code>trimObject(formData)</code> 한 줄이면 모든 문자열 필드가 정리됩니다.
        </Text>
      </Box>
    </Container>
  );
}

const SAMPLE_CODE = `<input
  {...register('address', {
    onChange: (e) => {
      e.target.value = e.target.value.trim();
    },
  })}
/>`;

const TRIM_OBJECT_CODE = `const formData = {
  name: '  홍길동  ',
  address: '  서울시 강남구  ',
  memo: '   ',
};

trimObject(formData);
// → { name: '홍길동', address: '서울시 강남구', memo: '' }`;
