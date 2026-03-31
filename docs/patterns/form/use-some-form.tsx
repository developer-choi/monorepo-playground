import { SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function useSomeForm() {
  const { replace } = useRouter();
  const { handleSubmit, setError, register } = useForm<SomeFormData>();

  const emailInputProps: InputProps = {
    ...register('email', { required: '이메일을 입력해주세요' }),
    label: '이메일',
    placeholder: 'example@email.com',
  };

  const passwordInputProps: InputProps = {
    ...register('password', { required: '비밀번호를 입력해주세요' }),
    label: '비밀번호',
    type: 'password',
  };

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: postSomeApi,
  });

  const onSubmit: SubmitHandler<SomeFormData> = useCallback(async (data) => {
    if (isPending || isSuccess) return;

    try {
      await mutateAsync(data);
      replace('/success');
    } catch (error) {
      if (error instanceof ApiResponseError && error.detail) {
        setError('email', { type: 'api', message: '...' }, { shouldFocus: true });
        return;
      }
      handleError(error);
    }
  }, [isPending, isSuccess, mutateAsync, replace, setError]);

  return {
    form: {
      onSubmit: handleSubmit(onSubmit),
      loading: isPending || isSuccess,
    },
    inputProps: {
      email: emailInputProps,
      password: passwordInputProps,
    },
  };
}

interface SomeFormData {
  email: string;
  password: string;
}
