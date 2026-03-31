import {Box, Callout, Container, Grid, Heading, Text} from '@radix-ui/themes';
import {codeToHtml} from 'shiki';
import {BadExample, GoodExample} from '@/form/components/example';

export default async function ValidationPage() {
  const codeHtml = await codeToHtml(SAMPLE_CODE, {
    lang: 'tsx',
    theme: 'github-light',
  });

  return (
    <Container p="6" size="4">
      <Box mb="6">
        <Heading mb="2" size="7">
          Trim 유효성검증
        </Heading>
        <Text as="p" color="gray" size="3">
          공백만 입력된 경우는 미입력과 동일하게 취급하고, 제출 시점에는 trim된 값을 보냅니다.
        </Text>
        <Text as="p" color="gray" mt="2" size="3">
          <strong>핵심: 유효성검증과 데이터 교정을 분리합니다.</strong>
        </Text>
      </Box>

      <Grid columns="2" gap="4">
        <BadExample />
        <GoodExample />
      </Grid>

      <Box mt="8">
        <Heading mb="4" size="5">
          왜 유효성검증과 데이터 교정을 분리하는가?
        </Heading>

        <Callout.Root color="orange">
          <Heading mb="2" size="4">
            시도: onChange에서 실시간 trim
          </Heading>
          {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
          <div dangerouslySetInnerHTML={{__html: codeHtml}} />
          <Callout.Text>
            &quot;101동&quot; 입력 후 &quot; 105호&quot;를 이어 쓰려고 스페이스바를 누르면 공백이 즉시 사라집니다.
          </Callout.Text>
          <Callout.Text>
            이렇게 입력 도중에 값을 가로채면 사용자가 의도한 대로 입력할 수 없습니다. 따라서, 유효성검증은 원본값으로
            수행하고 trim은 제출 시점에만 적용하는 편이 적합하다고 판단했습니다.
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
