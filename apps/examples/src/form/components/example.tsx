'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Box, Callout, Card, Flex, Heading, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input from '@/shared/components/form/Input';

interface FormValues {
  name: string;
}

export function BadExample() {
  const {form, inputProps, result} = useBadExampleForm();

  return (
    <Card>
      <Box p="4">
        <Heading size="4" mb="2">
          <Badge color="red" mr="2">BAD</Badge>
          기본 required만 사용
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          공백만 입력해도 통과됩니다. &quot;   &quot; 입력 후 제출해보세요.
        </Text>

        <form onSubmit={form.onSubmit}>
          <Flex direction="column" gap="3">
            <Input {...inputProps.name} />
            <Button type="submit" size="large">제출</Button>
          </Flex>
        </form>

        {result && (
          <Callout.Root color="blue" mt="4">
            <Callout.Text>
              <strong>제출된 값:</strong> {result}
              <br />
              앞뒤 공백이 그대로 제출됩니다.
            </Callout.Text>
          </Callout.Root>
        )}
      </Box>
    </Card>
  );
}

function useBadExampleForm() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>();
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
      <Box p="4">
        <Heading size="4" mb="2">
          <Badge color="green" mr="2">GOOD</Badge>
          유효성검증 + trim 분리
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          공백만 입력하면 에러, 앞뒤 공백은 제출 시 자동 제거됩니다.
        </Text>

        <form onSubmit={form.onSubmit}>
          <Flex direction="column" gap="3">
            <Input {...inputProps.name} />
            <Button type="submit" size="large">제출</Button>
          </Flex>
        </form>

        {result && (
          <Callout.Root color="green" mt="4">
            <Callout.Text>
              <strong>제출된 값 (trimmed):</strong> {result}
              <br />
              공백이 제거된 상태로 제출됩니다.
            </Callout.Text>
          </Callout.Root>
        )}
      </Box>
    </Card>
  );
}

function useGoodExampleForm() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>();
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
