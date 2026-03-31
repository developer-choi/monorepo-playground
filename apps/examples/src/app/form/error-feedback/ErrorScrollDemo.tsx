'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Box, Callout, Card, Flex, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input, {InputProps} from '@/shared/components/form/Input';
import styles from './ErrorScrollDemo.module.scss';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressDetail: string;
  company: string;
}

const GUIDE = '↓ 스크롤을 내려 제출 버튼을 눌러보세요';

export default function ErrorScrollDemo() {
  const {form, inputProps, result} = useErrorScrollForm();

  return (
    <Card>
      <Box p="4">
        <Text as="p" size="2" color="gray" mb="4">
          스크롤을 내려 하단의 제출 버튼을 클릭해보세요.
        </Text>
        <Box style={{maxHeight: 240, overflowY: 'auto'}}>
          <form className={styles.form} onSubmit={form.onSubmit}>
            <Flex direction="column" gap="3" p="1">
              <Input {...inputProps.name} />
              <Input {...inputProps.email} />
              <Input {...inputProps.phone} />
              <Input {...inputProps.address} />
              <Input {...inputProps.addressDetail} />
              <Input {...inputProps.company} />
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

function useErrorScrollForm() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: GUIDE,
      phone: GUIDE,
      address: GUIDE,
      addressDetail: GUIDE,
      company: GUIDE,
    },
  });
  const [result, setResult] = useState('');

  const nameInputProps: InputProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    readOnly: true,
    error: errors.name?.message,
  };

  const emailInputProps: InputProps = {
    ...register('email'),
    label: '이메일',
    readOnly: true,
  };

  const phoneInputProps: InputProps = {
    ...register('phone'),
    label: '전화번호',
    readOnly: true,
  };

  const addressInputProps: InputProps = {
    ...register('address'),
    label: '주소',
    readOnly: true,
  };

  const addressDetailInputProps: InputProps = {
    ...register('addressDetail'),
    label: '상세주소',
    readOnly: true,
  };

  const companyInputProps: InputProps = {
    ...register('company'),
    label: '회사',
    readOnly: true,
  };

  return {
    form: {
      onSubmit: handleSubmit((data) => setResult(JSON.stringify(data)), () => setResult('')),
    },
    inputProps: {
      name: nameInputProps,
      email: emailInputProps,
      phone: phoneInputProps,
      address: addressInputProps,
      addressDetail: addressDetailInputProps,
      company: companyInputProps,
    },
    result,
  };
}
