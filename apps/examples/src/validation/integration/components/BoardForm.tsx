'use client';

import {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {Box, Button, Card, Container, Flex, Heading, Separator, Text, TextField, TextArea, RadioGroup, Badge, Select} from '@radix-ui/themes';
import {Cross2Icon} from '@radix-ui/react-icons';
import {useRouter} from 'next/navigation';
import {postBoardApi, patchBoardApi} from '@/validation/integration/api';
import {isMutationSettling} from '@/shared/query/mutation';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {type BoardDetail, CreateBoardApiRequest, CreateBoardSchema, BOARD_TYPES, BOARD_CATEGORIES, BOARD_LIMITS} from '@/validation/integration/schema';

interface BoardFormProps {
  board: BoardDetail | undefined;
}

export default function BoardForm({board}: BoardFormProps) {
  const router = useRouter();
  const isEdit = !!board;

  const {register, handleSubmit, control, formState: {errors}} = useForm<CreateBoardApiRequest>({
    resolver: zodResolver(CreateBoardSchema),
    defaultValues: board ?? DEFAULT_FORM_DATA,
  });

  const handleClientSideError = useHandleClientSideError();
  const createMutation = useMutation({mutationFn: postBoardApi});
  const updateMutation = useMutation({mutationFn: patchBoardApi});
  const isPending = isMutationSettling(createMutation, updateMutation);

  const onSubmit = async (data: CreateBoardApiRequest) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({id: board.id, ...data});
        await Promise.all([revalidatePathFromClient('/validation/integration'), revalidatePathFromClient(`/validation/integration/${board.id}`)]);
        router.push(`/validation/integration/${board.id}`);
      } else {
        await createMutation.mutateAsync(data);
        await revalidatePathFromClient('/validation/integration');
        router.push('/validation/integration');
      }
    } catch (error) {
      handleClientSideError(error);
    }
  };

  return (
    <Container size="2" p="6">
      <Heading size="6" mb="5">{isEdit ? '글 수정' : '새 글 작성'}</Heading>
      <Card size="3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap="5">
            <Box>
              <Text as="label" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>제목</Text>
              <TextField.Root
                {...register('postTitle')}
                placeholder="제목을 입력하세요"
                size="2"
                maxLength={BOARD_LIMITS.postTitle.max}
              />
              {errors.postTitle && <Text color="red" size="1" mt="1">{errors.postTitle.message}</Text>}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>내용</Text>
              <TextArea
                {...register('postContent')}
                placeholder="내용을 입력하세요"
                size="2"
                rows={10}
              />
              {errors.postContent && <Text color="red" size="1" mt="1">{errors.postContent.message}</Text>}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>타입</Text>
              <Controller
                name="boardType"
                control={control}
                render={({field}) => (
                  <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                    <Flex gap="4">
                      {BOARD_TYPES.items.map(({value, label}) => (
                        <Text as="label" size="2" key={value}>
                          <Flex gap="2" align="center">
                            <RadioGroup.Item value={value} />
                            {label}
                          </Flex>
                        </Text>
                      ))}
                    </Flex>
                  </RadioGroup.Root>
                )}
              />
              {errors.boardType && <Text color="red" size="1" mt="1">{errors.boardType.message}</Text>}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>카테고리</Text>
              <Controller
                name="category"
                control={control}
                render={({field}) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger />
                    <Select.Content>
                      {BOARD_CATEGORIES.items.map(({value, label}) => (
                        <Select.Item key={value} value={value}>{label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.category && <Text color="red" size="1" mt="1">{errors.category.message}</Text>}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>태그</Text>
              <Controller
                name="tagList"
                control={control}
                render={({field}) => (
                  <TagInput value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.tagList && <Text color="red" size="1" mt="1">{errors.tagList.message}</Text>}
            </Box>

            <Separator size="4" />

            <Flex justify="end" gap="2">
              <Button type="button" variant="soft" color="gray" size="2" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" size="2" loading={isPending}>
                저장
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Container>
  );
}

const DEFAULT_FORM_DATA: CreateBoardApiRequest = {
  postTitle: '',
  postContent: '',
  boardType: 'normal',
  category: 'free',
  tagList: [],
};

function TagInput({value, onChange}: {value: string[]; onChange: (tags: string[]) => void}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput('');
  };

  return (
    <Box>
      <Flex gap="2" mb="2">
        <TextField.Root
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="태그 입력 후 Enter"
          maxLength={BOARD_LIMITS.tagList.maxLength}
        />
        <Button type="button" variant="soft" onClick={addTag}>추가</Button>
      </Flex>
      <Flex gap="1" wrap="wrap">
        {value.map(tag => (
          <Badge key={tag} variant="soft" size="2">
            {tag}
            <Box
              asChild
              style={{cursor: 'pointer', marginLeft: 4}}
              onClick={() => onChange(value.filter(t => t !== tag))}
            >
              <Cross2Icon width={12} height={12} />
            </Box>
          </Badge>
        ))}
      </Flex>
    </Box>
  );
}
