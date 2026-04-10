'use client';

import {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Separator,
  Text,
  TextField,
  TextArea,
  RadioGroup,
  Badge,
  Select,
} from '@radix-ui/themes';
import {Cross2Icon} from '@radix-ui/react-icons';
import {useRouter} from 'next/navigation';
import {postBoardApi, patchBoardApi} from '@/validation/integration/api';
import {isMutationSettling} from '@/shared/query/mutation';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {
  type BoardDetail,
  CreateBoardApiRequest,
  CreateBoardSchema,
  BOARD_TYPES,
  BOARD_CATEGORIES,
  BOARD_LIMITS,
} from '@/validation/integration/schema';

interface BoardFormProps {
  board: BoardDetail | undefined;
}

export default function BoardForm({board}: BoardFormProps) {
  const router = useRouter();
  const isEdit = !!board;

  const {
    register,
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<CreateBoardApiRequest>({
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
        await Promise.all([
          revalidatePathFromClient('/validation/integration'),
          revalidatePathFromClient(`/validation/integration/${board.id}`),
        ]);
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
    <Container p="6" size="2">
      <Heading mb="5" size="6">
        {isEdit ? '글 수정' : '새 글 작성'}
      </Heading>
      <Card size="3">
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <Flex direction="column" gap="5">
            <Box>
              {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
              <Text as="label" size="2" style={{display: 'block', marginBottom: 6}} weight="medium">
                제목
              </Text>
              <TextField.Root
                {...register('postTitle')}
                maxLength={BOARD_LIMITS.postTitle.max}
                placeholder="제목을 입력하세요"
                size="2"
              />
              {errors.postTitle && (
                <Text color="red" mt="1" size="1">
                  {errors.postTitle.message}
                </Text>
              )}
            </Box>

            <Box>
              {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
              <Text as="label" size="2" style={{display: 'block', marginBottom: 6}} weight="medium">
                내용
              </Text>
              <TextArea {...register('postContent')} placeholder="내용을 입력하세요" rows={10} size="2" />
              {errors.postContent && (
                <Text color="red" mt="1" size="1">
                  {errors.postContent.message}
                </Text>
              )}
            </Box>

            <Box>
              {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
              <Text as="label" size="2" style={{display: 'block', marginBottom: 6}} weight="medium">
                타입
              </Text>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                    <Flex gap="4">
                      {BOARD_TYPES.items.map(({value, label}) => (
                        <Text key={value} as="label" size="2">
                          <Flex align="center" gap="2">
                            <RadioGroup.Item value={value} />
                            {label}
                          </Flex>
                        </Text>
                      ))}
                    </Flex>
                  </RadioGroup.Root>
                )}
              />
              {errors.boardType && (
                <Text color="red" mt="1" size="1">
                  {errors.boardType.message}
                </Text>
              )}
            </Box>

            <Box>
              {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
              <Text as="label" size="2" style={{display: 'block', marginBottom: 6}} weight="medium">
                카테고리
              </Text>
              <Controller
                control={control}
                name="category"
                render={({field}) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger />
                    <Select.Content>
                      {BOARD_CATEGORIES.items.map(({value, label}) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
              {errors.category && (
                <Text color="red" mt="1" size="1">
                  {errors.category.message}
                </Text>
              )}
            </Box>

            <Box>
              {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
              <Text as="label" size="2" style={{display: 'block', marginBottom: 6}} weight="medium">
                태그
              </Text>
              <Controller
                control={control}
                name="tagList"
                render={({field}) => <TagInput value={field.value} onChange={field.onChange} />}
              />
              {errors.tagList && (
                <Text color="red" mt="1" size="1">
                  {errors.tagList.message}
                </Text>
              )}
            </Box>

            <Separator size="4" />

            <Flex gap="2" justify="end">
              <Button color="gray" size="2" type="button" variant="soft" onClick={() => router.back()}>
                취소
              </Button>
              <Button loading={isPending} size="2" type="submit">
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
    if (!tag || value.includes(tag)) {
      return;
    }
    onChange([...value, tag]);
    setInput('');
  };

  return (
    <Box>
      <Flex gap="2" mb="2">
        <TextField.Root
          maxLength={BOARD_LIMITS.tagList.maxLength}
          placeholder="태그 입력 후 Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="soft" onClick={addTag}>
          추가
        </Button>
      </Flex>
      <Flex gap="1" wrap="wrap">
        {value.map((tag) => (
          <Badge key={tag} size="2" variant="soft">
            {tag}
            {/* eslint-disable no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
            <Box
              asChild
              style={{cursor: 'pointer', marginLeft: 4}}
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <Cross2Icon height={12} width={12} />
            </Box>
            {/* eslint-enable no-restricted-syntax */}
          </Badge>
        ))}
      </Flex>
    </Box>
  );
}
