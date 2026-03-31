'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Box, Callout, Card, Flex, Grid, Heading, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input, {InputProps} from '@/shared/components/form/Input';

interface FormValues {
  email: string;
}

export default function ValidationModeDemo() {
  return (
    <Grid columns="3" gap="4">
      <ModeForm
        mode="onSubmit"
        label="onSubmit (기본값)"
        badgeColor="blue"
        description="제출해야 에러가 나타납니다."
      />
      <ModeForm
        mode="onBlur"
        label="onBlur"
        badgeColor="orange"
        description="필드를 벗어나면 에러가 나타납니다."
      />
      <ModeForm
        mode="onChange"
        label="onChange"
        badgeColor="violet"
        description="입력하는 즉시 에러가 나타납니다."
      />
    </Grid>
  );
}

interface ModeFormProps {
  mode: 'onSubmit' | 'onBlur' | 'onChange';
  label: string;
  badgeColor: 'blue' | 'orange' | 'violet';
  description: string;
}

function ModeForm({mode, label, badgeColor, description}: ModeFormProps) {
  const {form, inputProps, result} = useModeForm(mode);

  return (
    <Card>
      <Box p="4">
        <Heading size="3" mb="1">
          <Badge color={badgeColor}>{label}</Badge>
        </Heading>
        <Text as="p" size="1" color="gray" mb="3">{description}</Text>
        <form onSubmit={form.onSubmit}>
          <Flex direction="column" gap="3">
            <Input {...inputProps.email} />
            <Button type="submit">제출</Button>
          </Flex>
        </form>
        {result && (
          <Callout.Root color="blue" mt="3" size="1">
            <Callout.Text><strong>제출된 값:</strong> {result}</Callout.Text>
          </Callout.Root>
        )}
      </Box>
    </Card>
  );
}

function useModeForm(mode: 'onSubmit' | 'onBlur' | 'onChange') {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>({mode});
  const [result, setResult] = useState('');

  const emailInputProps: InputProps = {
    ...register('email', {
      required: '이메일을 입력해주세요.',
      pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
    }),
    placeholder: 'test@example.com',
    error: errors.email?.message,
  };

  return {
    form: {
      onSubmit: handleSubmit((data) => setResult(JSON.stringify(data)), () => setResult('')),
    },
    inputProps: {
      email: emailInputProps,
    },
    result,
  };
}
