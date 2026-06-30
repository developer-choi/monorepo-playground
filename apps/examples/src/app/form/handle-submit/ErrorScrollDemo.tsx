'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Button, Callout, Card, TextField, type TextFieldProps} from '@monorepo-playground/design-system';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
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
      <p className={clsx(typography.body2, styles.description)}>스크롤을 내려 하단의 제출 버튼을 클릭해보세요.</p>
      <div className={styles.scrollContainer}>
        <form onSubmit={form.onSubmit}>
          <div className={styles.formFields}>
            <TextField {...inputProps.name} />
            <TextField {...inputProps.email} />
            <TextField {...inputProps.phone} />
            <TextField {...inputProps.address} />
            <TextField {...inputProps.addressDetail} />
            <TextField {...inputProps.company} />
            <Button size="large" type="submit">
              제출
            </Button>
          </div>
        </form>
      </div>
      {result && (
        <Callout className={styles.resultCallout} color="info">
          <strong>제출된 값:</strong> {result}
        </Callout>
      )}
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

  const nameInputProps: TextFieldProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    readOnly: true,
    error: errors.name?.message,
  };

  const emailInputProps: TextFieldProps = {
    ...register('email'),
    label: '이메일',
    readOnly: true,
  };

  const phoneInputProps: TextFieldProps = {
    ...register('phone'),
    label: '전화번호',
    readOnly: true,
  };

  const addressInputProps: TextFieldProps = {
    ...register('address'),
    label: '주소',
    readOnly: true,
  };

  const addressDetailInputProps: TextFieldProps = {
    ...register('addressDetail'),
    label: '상세주소',
    readOnly: true,
  };

  const companyInputProps: TextFieldProps = {
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
