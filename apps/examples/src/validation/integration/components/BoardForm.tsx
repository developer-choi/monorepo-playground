'use client';

import {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {Box, Card, Container, Flex, Separator, TextField, TextArea, RadioGroup, Badge, Select} from '@radix-ui/themes';
import clsx from 'clsx';
import {Cross2Icon} from '@radix-ui/react-icons';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import {useRouter} from 'next/navigation';
import {postBoardApi, patchBoardApi} from '@/validation/integration/api';
import {isMutationSettling} from '@/shared/query/mutation';
import {useHandleClientSideError} from '@/shared/error/handler/client';
import {revalidatePathFromClient} from '@/shared/server-actions';
import {
  type BoardDetail,
  CreateBoardApiRequest,
  createBoardSchema,
  BOARD_TYPES,
  BOARD_CATEGORIES,
  BOARD_LIMITS,
} from '@/validation/integration/schema';
import styles from './BoardForm.module.scss';

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
    resolver: zodResolver(createBoardSchema),
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
      <h2 className={clsx(typography.h2, styles.formTitle)}>{isEdit ? '글 수정' : '새 글 작성'}</h2>
      <Card size="3">
        <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
          <Flex direction="column" gap="5">
            <Box>
              <label className={clsx(typography.body2, styles.fieldLabel)}>제목</label>
              <TextField.Root
                {...register('postTitle')}
                maxLength={BOARD_LIMITS.postTitle.max}
                placeholder="제목을 입력하세요"
                size="2"
              />
              {errors.postTitle && (
                <p className={clsx(typography.body3, styles.errorMessage)}>{errors.postTitle.message}</p>
              )}
            </Box>

            <Box>
              <label className={clsx(typography.body2, styles.fieldLabel)}>내용</label>
              <TextArea {...register('postContent')} placeholder="내용을 입력하세요" rows={10} size="2" />
              {errors.postContent && (
                <p className={clsx(typography.body3, styles.errorMessage)}>{errors.postContent.message}</p>
              )}
            </Box>

            <Box>
              <label className={clsx(typography.body2, styles.fieldLabel)}>타입</label>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <RadioGroup.Root value={field.value} onValueChange={field.onChange}>
                    <Flex gap="4">
                      {BOARD_TYPES.items.map(({value, label}) => (
                        <label key={value} className={typography.body2}>
                          <Flex align="center" gap="2">
                            <RadioGroup.Item value={value} />
                            {label}
                          </Flex>
                        </label>
                      ))}
                    </Flex>
                  </RadioGroup.Root>
                )}
              />
              {errors.boardType && (
                <p className={clsx(typography.body3, styles.errorMessage)}>{errors.boardType.message}</p>
              )}
            </Box>

            <Box>
              <label className={clsx(typography.body2, styles.fieldLabel)}>카테고리</label>
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
                <p className={clsx(typography.body3, styles.errorMessage)}>{errors.category.message}</p>
              )}
            </Box>

            <Box>
              <label className={clsx(typography.body2, styles.fieldLabel)}>태그</label>
              <Controller
                control={control}
                name="tagList"
                render={({field}) => <TagInput value={field.value} onChange={field.onChange} />}
              />
              {errors.tagList && (
                <p className={clsx(typography.body3, styles.errorMessage)}>{errors.tagList.message}</p>
              )}
            </Box>

            <Separator size="4" />

            <Flex gap="2" justify="end">
              <Button color="secondary" size="medium" type="button" variant="outlined" onClick={() => router.back()}>
                취소
              </Button>
              <Button loading={isPending} size="medium" type="submit">
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
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" variant="outlined" onClick={addTag}>
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
              onClick={() => onChange(value.filter((item) => item !== tag))}
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
