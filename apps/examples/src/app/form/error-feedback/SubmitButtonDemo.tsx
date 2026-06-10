'use client';

import {FormEvent, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Box, Callout, Card, Flex, Grid} from '@radix-ui/themes';
import clsx from 'clsx';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import Input, {InputProps} from '@/shared/components/form/Input';
import styles from './SubmitButtonDemo.module.scss';

interface FormValues {
  name: string;
  email: string;
}

export default function SubmitButtonDemo() {
  return (
    <Grid columns="2" gap="4">
      <BadSubmit />
      <GoodSubmit />
    </Grid>
  );
}

const EMAIL_RULES = {
  required: '이메일을 입력해주세요.',
  pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
} as const;

function BadSubmit() {
  const {form, inputProps, isValid} = useBadSubmitForm();

  return (
    <Card>
      <Box p="4">
        <h4 className={clsx(typography.h4, styles.cardTitle)}>
          <Badge color="red" mr="2">
            BAD
          </Badge>
          isValid로 비활성화
        </h4>
        <p className={clsx(typography.body2, styles.description)}>버튼이 비활성화되어 클릭 자체가 불가능합니다.</p>
        <form onSubmit={form.onSubmit}>
          <Flex direction="column" gap="3">
            <Input {...inputProps.name} />
            <Input {...inputProps.email} />
            <Button disabled={!isValid} size="large" type="submit">
              제출
            </Button>
          </Flex>
        </form>
      </Box>
    </Card>
  );
}

function GoodSubmit() {
  const {form, inputProps, result} = useGoodSubmitForm();

  return (
    <Card>
      <Box p="4">
        <h4 className={clsx(typography.h4, styles.cardTitle)}>
          <Badge color="green" mr="2">
            GOOD
          </Badge>
          항상 활성화
        </h4>
        <p className={clsx(typography.body2, styles.description)}>제출 시 에러 피드백으로 안내합니다.</p>
        <form onSubmit={form.onSubmit}>
          <Flex direction="column" gap="3">
            <Input {...inputProps.name} />
            <Input {...inputProps.email} />
            <Button size="large" type="submit">
              제출
            </Button>
          </Flex>
        </form>
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

function useBadSubmitForm() {
  const {
    register,
    formState: {errors, isValid},
  } = useForm<FormValues>({mode: 'onChange'});

  const nameInputProps: InputProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    error: errors.name?.message,
  };

  const emailInputProps: InputProps = {
    ...register('email', EMAIL_RULES),
    label: '이메일',
    error: errors.email?.message,
  };

  return {
    form: {
      onSubmit: (event: FormEvent) => event.preventDefault(),
    },
    inputProps: {
      name: nameInputProps,
      email: emailInputProps,
    },
    isValid,
  };
}

function useGoodSubmitForm() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>();
  const [result, setResult] = useState('');

  const nameInputProps: InputProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    error: errors.name?.message,
  };

  const emailInputProps: InputProps = {
    ...register('email', EMAIL_RULES),
    label: '이메일',
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
      name: nameInputProps,
      email: emailInputProps,
    },
    result,
  };
}
