'use client';

import {FormEvent, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Button, Callout, Card, TextField, type TextFieldProps} from '@monorepo-playground/design-system';
import styles from './SubmitLifecycleDemo.module.scss';

type SuccessVariant = 'navigate' | 'stay';

interface SubmitLifecycleDemoProps {
  variant: SuccessVariant;
}

interface FormValues {
  name: string;
  email: string;
}

interface SubmitLifecycleForm {
  form: {
    onSubmit: (event: FormEvent) => void;
    loading: boolean;
  };
  inputProps: {
    name: TextFieldProps;
    email: TextFieldProps;
  };
  errorMessage: string | undefined;
}

const SENTINEL_EMAIL = 'taken@example.com';
const SIGNUP_ERROR = '이미 가입된 이메일입니다. 다른 이메일로 회원가입을 진행해 주세요.';
const MOCK_LATENCY_MS = 1200;

export default function SubmitLifecycleDemo({variant}: SubmitLifecycleDemoProps) {
  const {form, inputProps, errorMessage} = useSubmitLifecycleForm(variant);

  return (
    <Card>
      <form onSubmit={form.onSubmit}>
        <div className={styles.formFields}>
          <TextField {...inputProps.name} />
          <TextField {...inputProps.email} />
          <Button loading={form.loading} size="large" type="submit">
            회원가입
          </Button>
        </div>
      </form>
      {errorMessage && (
        <Callout className={styles.errorCallout} color="danger">
          {errorMessage}
        </Callout>
      )}
    </Card>
  );
}

const EMAIL_RULES = {
  required: '이메일을 입력해주세요.',
  pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
} as const;

async function dummySignUpApi(data: FormValues) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  if (data.email === SENTINEL_EMAIL) {
    throw new Error(SIGNUP_ERROR);
  }
  return data;
}

function useSubmitLifecycleForm(variant: SuccessVariant): SubmitLifecycleForm {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<FormValues>({defaultValues: {name: '아래 이메일을 바꿔서 제출해보세요.', email: SENTINEL_EMAIL}});
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    variant === 'navigate' ? SIGNUP_ERROR : undefined,
  );

  const mutation = useMutation({mutationFn: dummySignUpApi});
  // 성공 후 화면 이동이 끝날 때까지 로딩 유지 → 이동 직전 재클릭 방지 (isSuccess 포함 이유)
  const isPending = mutation.isPending || mutation.isSuccess;

  const onSubmit = handleSubmit(async (data) => {
    // Button loading은 onClick만 막으므로, 네이티브 Enter 중복 제출은 이 가드로 차단한다
    if (isPending) {
      return;
    }
    setErrorMessage(undefined);
    try {
      await mutation.mutateAsync(data);
      if (variant === 'navigate') {
        router.push('/form/handle-submit/submitted');
      } else {
        // reset(값)은 uncontrolled 입력의 화면 값까지는 안 비운다 (네이티브 폼 리셋은 무인자 reset() 전용 경로) → keepFieldsRef로 DOM까지 반영
        reset({name: '', email: ''}, {keepFieldsRef: true});
        mutation.reset();
        // 머무름은 화면 전환이라는 성공 신호가 없으므로 별도 피드백을 준다
        toast.success('회원가입이 완료되었습니다.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '제출에 실패했습니다.');
    }
  });

  const nameInputProps: TextFieldProps = {
    ...register('name', {required: '이름을 입력해주세요.'}),
    label: '이름',
    error: errors.name?.message,
  };

  const emailInputProps: TextFieldProps = {
    ...register('email', EMAIL_RULES),
    label: '이메일',
    error: errors.email?.message,
  };

  return {
    form: {
      onSubmit: (event: FormEvent) => void onSubmit(event),
      loading: isPending,
    },
    inputProps: {
      name: nameInputProps,
      email: emailInputProps,
    },
    errorMessage,
  };
}
