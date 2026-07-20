'use client';

import {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {
  Badge,
  Button,
  Caption,
  Card,
  IconButton,
  Label,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TextField,
} from '@monorepo-playground/design-system';
import clsx from 'clsx';
import {Cross2Icon} from '@radix-ui/react-icons';
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
    <div className={styles.page}>
      <h2 className={clsx(typography.h2, styles.formTitle)}>{isEdit ? '글 수정' : '새 글 작성'}</h2>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formCol}>
            <TextField
              {...register('postTitle')}
              error={errors.postTitle?.message}
              label="제목"
              maxLength={BOARD_LIMITS.postTitle.max}
              placeholder="제목을 입력하세요"
            />

            <TextArea
              {...register('postContent')}
              error={errors.postContent?.message}
              label="내용"
              placeholder="내용을 입력하세요"
              rows={10}
            />

            <div className={styles.field}>
              <Label isInvalid={!!errors.boardType}>타입</Label>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <RadioGroup name={field.name} value={field.value} onChange={field.onChange}>
                    {BOARD_TYPES.items.map(({value, label}) => (
                      <Radio key={value} value={value}>
                        {label}
                      </Radio>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.boardType && <Caption isInvalid>{errors.boardType.message}</Caption>}
            </div>

            <Controller
              control={control}
              name="category"
              render={({field}) => (
                <Select
                  error={errors.category?.message}
                  label="카테고리"
                  options={BOARD_CATEGORIES.items}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div className={styles.field}>
              <Label isInvalid={!!errors.tagList}>태그</Label>
              <Controller
                control={control}
                name="tagList"
                render={({field}) => <TagInput value={field.value} onChange={field.onChange} />}
              />
              {errors.tagList && <Caption isInvalid>{errors.tagList.message}</Caption>}
            </div>

            <div className={styles.actions}>
              <Button color="secondary" size="xLarge" type="button" variant="outlined" onClick={() => router.back()}>
                취소
              </Button>
              <Button loading={isPending} size="xLarge" type="submit">
                저장
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
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
    <div>
      <div className={styles.tagInputRow}>
        <TextField
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
        <Button size="large" type="button" variant="outlined" onClick={addTag}>
          추가
        </Button>
      </div>
      <div className={styles.tagList}>
        {value.map((tag) => (
          <Badge key={tag} variant="soft">
            {tag}
            <IconButton
              className={styles.tagRemove}
              icon={<Cross2Icon />}
              size="small"
              onClick={() => onChange(value.filter((item) => item !== tag))}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
