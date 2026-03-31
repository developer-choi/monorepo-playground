'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Box, Callout, Card, Flex, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input from '@/shared/components/form/Input';
import styles from './ErrorScrollDemo.module.scss';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressDetail: string;
  company: string;
}

export default function ErrorScrollDemo() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: 'test@example.com',
      phone: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '4층 401호',
      company: '프론트엔드 주식회사',
    },
  });
  const [result, setResult] = useState('');

  return (
    <Card>
      <Box p="4">
        <Text as="p" size="2" color="gray" mb="4">
          스크롤을 내려 하단의 제출 버튼을 클릭해보세요.
        </Text>
        <Box style={{maxHeight: 240, overflowY: 'auto'}}>
          <form className={styles.form} onSubmit={handleSubmit((data) => setResult(JSON.stringify(data)), () => setResult(''))}>
            <Flex direction="column" gap="3" p="1">
              <Input {...register('name', {required: '이름을 입력해주세요.'})} label="이름" placeholder="이름을 입력해주세요" readOnly error={errors.name?.message} />
              <Input {...register('email')} label="이메일" readOnly />
              <Input {...register('phone')} label="전화번호" readOnly />
              <Input {...register('address')} label="주소" readOnly />
              <Input {...register('addressDetail')} label="상세주소" readOnly />
              <Input {...register('company')} label="회사" readOnly />
              <Button type="submit" size="large">제출</Button>
            </Flex>
          </form>
        </Box>
        {result && (
          <Callout.Root color="blue" mt="4" size="1">
            <Callout.Text><strong>제출된 값:</strong> {result}</Callout.Text>
          </Callout.Root>
        )}
      </Box>
    </Card>
  );
}
