import {Box, Callout, Container, Grid, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import {BadExample, GoodExample} from '@/form/components/example';

export default async function ValidationPage() {
  const codeHtml = await codeToHtml(SAMPLE_CODE, {
    lang: 'tsx',
    theme: 'github-light',
  });

  return (
    <Container size="4" p="6">
      <Box mb="6">
        <Heading size="7" mb="2">Trim 유효성검증</Heading>
        <Text as="p" color="gray" size="3">
          공백만 입력하면 미입력과 동일하게 취급하고, 제출 시에는 trim된 값을 사용해야 합니다.
          <br />
          <strong>핵심: 유효성검증과 데이터 교정을 분리 구현합니다.</strong>
        </Text>
      </Box>

      <Grid columns="2" gap="4">
        <BadExample />
        <GoodExample />
      </Grid>

      <Box mt="8">
        <Heading size="5" mb="4">왜 유효성검증과 데이터 교정을 분리하는가?</Heading>

        <Callout.Root color="orange">
          <Callout.Text>
            <strong>시도: onChange에서 실시간 trim</strong>
          </Callout.Text>
          <div dangerouslySetInnerHTML={{__html: codeHtml}} />
          <Callout.Text>
            &quot;101동&quot; 입력 후 &quot; 105호&quot;를 이어 쓰려고 스페이스바를 누르면 공백이 즉시 제거됩니다.
            <br />
            입력 도중에 값을 가로채면 안 되므로, 유효성검증은 원본값으로 하고 trim은 제출 시점에 수행해야 합니다.
          </Callout.Text>
        </Callout.Root>
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
