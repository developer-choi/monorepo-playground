'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Box, Callout, Card, Flex} from '@radix-ui/themes';
import clsx from 'clsx';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
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

export default function ErrorScrollDemo() {
  const {form, inputProps, result} = useErrorScrollForm();

  return (
    <Card>
      <Box p="4">
        <p className={clsx(typography.body2, styles.description)}>스크롤을 내려 하단의 제출 버튼을 클릭해보세요.</p>
        <Box className={styles.scrollContainer}>
          <form className={styles.form} onSubmit={form.onSubmit}>
            <Flex direction="column" gap="3" p="1">
              <Input {...inputProps.name} />
              <Input {...inputProps.email} />
              <Input {...inputProps.phone} />
              <Input {...inputProps.address} />
              <Input {...inputProps.addressDetail} />
              <Input {...inputProps.company} />
              <Button size="large" type="submit">
                제출
              </Button>
            </Flex>
          </form>
        </Box>
        {result && (
          <Callout.Root color="blue" mt="4" size="1">
            <Callout.Text>
              <strong>제출된 값:</strong> {result}
            </Callout.Text>
          </Callout.Root>
        )}
      </Box>
    </Card>
  );
}

const GUIDE = '↓ 스크롤을 내려 제출 버튼을 눌러보세요';

function useErrorScrollForm() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
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
      onSubmit: handleSubmit(
        (data) => setResult(JSON.stringify(data)),
        () => setResult(''),
      ),
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
