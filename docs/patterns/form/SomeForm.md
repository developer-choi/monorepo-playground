# use[...]Form 커스텀 훅

이 훅을 사용하는 컴포넌트가 1개면 컴포넌트 파일 밑에 작성한다. 파일의 주인공은 컴포넌트이고, 훅은 그 아래에 위치한다.

## 컴포넌트

```tsx
export default function SomeForm() {
  const { form, inputProps, introductionLength } = useSomeForm();

  return (
    <form onSubmit={form.onSubmit}>
      <Input {...inputProps.email} />
      <Input {...inputProps.password} />
      <TextArea {...inputProps.introduction} />
      <p>{introductionLength}/200</p>
      <Button loading={form.loading} type="submit">제출</Button>
    </form>
  );
}
```

## 커스텀 훅

```tsx
function useSomeForm() {
  const { replace } = useRouter();
  const handleClientSideError = useClientSideError();
  const { handleSubmit, setError, register, control } = useForm<SomeFormData>();

  const emailInputProps: InputProps = {
    ...register('email', { required: '이메일을 입력해주세요' }),
    label: '이메일',
    placeholder: 'example@email.com',
  };

  const passwordInputProps: InputProps = {
    ...register('password', {
      required: '비밀번호를 입력해주세요', // 필수인 경우. 추가 규칙은 필요한 경우 작성
    }),
    label: '비밀번호',
    placeholder: '영문, 숫자 포함 8자 이상',
    type: 'password',
  };

  const introductionTextAreaProps: TextAreaProps = {
    ...register('introduction', { maxLength: { value: 200, message: '200자 이내로 입력해주세요' } }),
    label: '자기소개',
    placeholder: '간단한 자기소개를 입력해주세요',
  };

  // watch() 대신 useFormWatch()를 사용한다
  const introductionLength = useFormWatch({ control, name: 'introduction' })?.length ?? 0;

  // mutate(콜백) 대신 mutateAsync + try-catch
  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: postSomeApi,
  });

  const onSubmit: SubmitHandler<SomeFormData> = async (data) => {
    // 페이지 이동 전까지 중복 제출 방지
    if (isPending || isSuccess) return;

    try {
      await mutateAsync(data);
      replace('/success');
    } catch (error) {
      // 개별 에러를 먼저 분기, 나머지는 공통 함수에 위임
      if (error instanceof ApiResponseError && error.detail) {
        setError('email', { type: 'api', message: '...' }, { shouldFocus: true });
        return;
      }
      handleClientSideError(error);
    }
  };

  /* 반환 구조: 영향 범위 기준으로 그룹화한다.
   * form — 폼 레벨: onSubmit(폼 전체 제출), loading(폼 전체 비활성)
   * inputProps — 필드 레벨: 각 필드별 props를 키로 구분 */
  return {
    form: {
      onSubmit: handleSubmit(onSubmit),
      /* loading 상태:
       * 기본: isPending — API 호출 후 같은 화면에 머무는 경우
       * 성공 후 언마운트: isPending || isSuccess — 페이지 이동, 모달 닫힘 등 한정.
       *   API 성공 → 실제 언마운트 사이 간격에 버튼이 재활성화되는 것을 방지한다.
       * 이 훅은 성공 후 페이지 이동하므로 isSuccess 포함. */
      loading: isPending || isSuccess,
    },
    inputProps: {
      email: emailInputProps,
      password: passwordInputProps,
      introduction: introductionTextAreaProps,
    },
    introductionLength,
  };
}

interface SomeFormData {
  email: string;
  password: string;
  introduction: string;
}
```
