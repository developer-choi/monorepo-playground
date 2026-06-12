'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Button, Callout, Card, TextField} from '@monorepo-playground/design-system';
import clsx from 'clsx';
import typography from '@monorepo-playground/design-system/styles/typography';
import styles from './example.module.scss';

interface FormValues {
  name: string;
}

export function BadExample() {
  const {form, inputProps, result} = useBadExampleForm();

  return (
    <Card>
      <h4 className={clsx(typography.h4, styles.cardTitle)}>
        <Badge className={styles.statusBadge} color="danger">
          BAD
        </Badge>
        기본 required만 사용
      </h4>
      <p className={clsx(typography.body2, styles.description)}>
        공백만 입력해도 통과됩니다. &quot; &quot; 입력 후 제출해보세요.
      </p>

      <form onSubmit={form.onSubmit}>
        <div className={styles.formFields}>
          <TextField {...inputProps.name} />
          <Button size="large" type="submit">
            제출
          </Button>
        </div>
      </form>

      {result && (
        <Callout className={styles.resultCallout} color="info">
          <strong>제출된 값:</strong> {result}
          <br />
          앞뒤 공백이 그대로 제출됩니다.
        </Callout>
      )}
    </Card>
  );
}

function useBadExampleForm() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>();
  const [result, setResult] = useState('');

  const nameInputProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    placeholder: '공백만 입력해보세요',
    error: errors.name?.message,
  };

  return {
    form: {
      onSubmit: handleSubmit((data) => setResult(JSON.stringify(data))),
    },
    inputProps: {
      name: nameInputProps,
    },
    result,
  };
}

export function GoodExample() {
  const {form, inputProps, result} = useGoodExampleForm();

  return (
    <Card>
      <h4 className={clsx(typography.h4, styles.cardTitle)}>
        <Badge className={styles.statusBadge} color="success">
          GOOD
        </Badge>
        유효성검증 + trim 분리
      </h4>
      <p className={clsx(typography.body2, styles.description)}>
        공백만 입력하면 에러, 앞뒤 공백은 제출 시 자동 제거됩니다.
      </p>

      <form onSubmit={form.onSubmit}>
        <div className={styles.formFields}>
          <TextField {...inputProps.name} />
          <Button size="large" type="submit">
            제출
          </Button>
        </div>
      </form>

      {result && (
        <Callout className={styles.resultCallout} color="success">
          <strong>제출된 값 (trimmed):</strong> {result}
          <br />
          공백이 제거된 상태로 제출됩니다.
        </Callout>
      )}
    </Card>
  );
}

function useGoodExampleForm() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>();
  const [result, setResult] = useState('');

  const nameInputProps = {
    ...register('name', {
      required: '이름을 입력해주세요.',
      validate: {notBlank: validateNotBlank},
    }),
    label: '이름',
    placeholder: '공백만 입력해보세요',
    error: errors.name?.message,
  };

  return {
    form: {
      onSubmit: handleSubmit((data) => {
        setResult(JSON.stringify({name: data.name.trim()}));
      }),
    },
    inputProps: {
      name: nameInputProps,
    },
    result,
  };
}

function validateNotBlank(value: string) {
  return value.trim() !== '' || '공백만 입력할 수 없습니다.';
}
