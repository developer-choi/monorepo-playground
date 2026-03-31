'use client';

import {useForm} from 'react-hook-form';
import {Box, Card, Flex, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input from '@/shared/components/form/Input';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ErrorScrollDemo() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>({
    defaultValues: {
      name: '홍길동',
      email: '',
      phone: '010-1234-5678',
      address: '서울시 강남구',
    },
  });

  return (
    <Card>
      <Box p="4">
        <Text as="p" size="2" color="gray" mb="4">
          이메일 필드만 비어있습니다. 제출하면 비어있는 이메일 필드로 포커스가 이동합니다.
        </Text>
        <form onSubmit={handleSubmit(() => {})}>
          <Flex direction="column" gap="3">
            <Input {...register('name', {required: '이름을 입력해주세요.'})} label="이름" error={errors.name?.message} />
            <Input {...register('email', {required: '이메일을 입력해주세요.'})} label="이메일" error={errors.email?.message} />
            <Input {...register('phone', {required: '전화번호를 입력해주세요.'})} label="전화번호" error={errors.phone?.message} />
            <Input {...register('address', {required: '주소를 입력해주세요.'})} label="주소" error={errors.address?.message} />
            <Button type="submit" size="large">제출</Button>
          </Flex>
        </form>
      </Box>
    </Card>
  );
}
