'use client';

import {useForm} from 'react-hook-form';
import {Box, Callout, Card, Flex, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input from '@/shared/components/form/Input';

interface FormValues {
  email: string;
  password: string;
}

export default function FormLevelErrorDemo() {
  const {register, handleSubmit, setError, formState: {errors}} = useForm<FormValues>();

  const onSubmit = handleSubmit(() => {
    setError('root', {message: '이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.'});
  });

  return (
    <Card>
      <Box p="4">
        <Text as="p" size="2" color="gray" mb="4">
          이메일과 비밀번호를 입력하고 제출하면 서버 에러를 시뮬레이션합니다.
          <br />
          필드를 비운 채 제출하면 필드별 에러가, 모두 채우고 제출하면 폼 전체 에러가 나타납니다.
        </Text>
        <form onSubmit={onSubmit}>
          <Flex direction="column" gap="3">
            {errors.root && (
              <Callout.Root color="red" size="1">
                <Callout.Text>{errors.root.message}</Callout.Text>
              </Callout.Root>
            )}
            <Input
              {...register('email', {required: '이메일을 입력해주세요.'})}
              label="이메일"
              placeholder="test@example.com"
              error={errors.email?.message}
            />
            <Input
              {...register('password', {required: '비밀번호를 입력해주세요.'})}
              label="비밀번호"
              type="password"
              error={errors.password?.message}
            />
            <Button type="submit" size="large">가입하기</Button>
          </Flex>
        </form>
      </Box>
    </Card>
  );
}
