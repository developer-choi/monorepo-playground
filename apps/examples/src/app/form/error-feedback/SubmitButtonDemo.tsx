'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Badge, Box, Card, Flex, Grid, Heading, Text} from '@radix-ui/themes';
import Button from '@/shared/components/form/Button';
import Input from '@/shared/components/form/Input';

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

function BadSubmit() {
  const {register, formState: {errors, isValid}} = useForm<FormValues>({mode: 'onChange'});

  return (
    <Card>
      <Box p="4">
        <Heading size="4" mb="2">
          <Badge color="red" mr="2">BAD</Badge>
          isValid로 비활성화
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          버튼이 비활성화되어 뭘 고쳐야 하는지 알 수 없습니다.
        </Text>
        <form onSubmit={(e) => e.preventDefault()}>
          <Flex direction="column" gap="3">
            <Input
              {...register('name', {required: '이름을 입력해주세요.'})}
              label="이름"
              error={errors.name?.message}
            />
            <Input
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
              })}
              label="이메일"
              error={errors.email?.message}
            />
            <Button type="submit" size="large" disabled={!isValid}>제출</Button>
          </Flex>
        </form>
      </Box>
    </Card>
  );
}

function GoodSubmit() {
  const {register, handleSubmit, formState: {errors}} = useForm<FormValues>();
  const [submitted, setSubmitted] = useState(false);

  return (
    <Card>
      <Box p="4">
        <Heading size="4" mb="2">
          <Badge color="green" mr="2">GOOD</Badge>
          항상 활성화
        </Heading>
        <Text as="p" size="2" color="gray" mb="4">
          제출 시 에러 피드백으로 안내합니다.
        </Text>
        <form onSubmit={handleSubmit(() => setSubmitted(true))}>
          <Flex direction="column" gap="3">
            <Input
              {...register('name', {required: '이름을 입력해주세요.'})}
              label="이름"
              error={errors.name?.message}
            />
            <Input
              {...register('email', {
                required: '이메일을 입력해주세요.',
                pattern: {value: /^\S+@\S+\.\S+$/, message: '올바른 이메일 형식이 아닙니다.'},
              })}
              label="이메일"
              error={errors.email?.message}
            />
            <Button type="submit" size="large">제출</Button>
          </Flex>
        </form>
        {submitted && <Text size="1" color="green" mt="2">제출 성공</Text>}
      </Box>
    </Card>
  );
}
