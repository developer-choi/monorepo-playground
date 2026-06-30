'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Button, Callout, Card, TextField, type TextFieldProps} from '@monorepo-playground/design-system';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './ValidationModeDemo.module.scss';

interface FormValues {
  email: string;
}

interface ModeFormProps {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
  label: string;
  badgeColor: 'info' | 'warning' | 'neutral';
  description: string;
}

export default function ValidationModeDemo() {
  return (
    <div className={styles.modeGrid}>
      <ModeForm badgeColor="info" description="제출해야 에러가 나타납니다." label="onSubmit (기본값)" mode="onSubmit" />
      <ModeForm badgeColor="warning" description="필드를 벗어나면 에러가 나타납니다." label="onBlur" mode="onBlur" />
      <ModeForm badgeColor="neutral" description="입력하는 즉시 에러가 나타납니다." label="onChange" mode="onChange" />
    </div>
  );
}

function ModeForm({mode, label, badgeColor, description}: ModeFormProps) {
  const {form, inputProps, result} = useModeForm(mode);

  return (
    <Card>
      <h4 className={clsx(typography.body1, styles.cardTitle)}>
        <Badge color={badgeColor}>{label}</Badge>
      </h4>
      <p className={clsx(typography.body3, styles.description)}>{description}</p>
      <form onSubmit={form.onSubmit}>
        <div className={styles.formFields}>
          <TextField {...inputProps.email} />
          <Button type="submit">제출</Button>
        </div>
      </form>
      {result && (
        <Callout className={styles.resultCallout} color="info">
          <strong>제출된 값:</strong> {result}
        </Callout>
      )}
    </Card>
  );
}

function useModeForm(mode: 'onSubmit' | 'onBlur' | 'onChange') {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({mode});
  const [result, setResult] = useState('');

  const emailInputProps: TextFieldProps = {
    ...register('email', {
      required: '이메일을 입력해주세요.',
      pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
    }),
    placeholder: 'test@example.com',
    error: errors.email?.message,
  };

  return {
    form: {
      onSubmit: handleSubmit(
        (data) => setResult(JSON.stringify(data)),
        () => setResult(''),
      ),
    },
    inputProps: {
      email: emailInputProps,
    },
    result,
  };
}
