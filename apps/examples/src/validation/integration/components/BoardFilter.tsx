'use client';

import {useForm, Controller} from 'react-hook-form';
import {Button, Card, Checkbox, Label, Select, TextField} from '@monorepo-playground/design-system';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {useRouter, useSearchParams} from 'next/navigation';
import queryString from 'query-string';
import {safeParsePartial} from '@/shared/utils/zod';
import {buildUrlWithQuery} from '@/shared/utils/url';
import {BoardListFilter, boardListFilterSchema, BOARD_CATEGORIES, BOARD_TYPES} from '@/validation/integration/schema';
import styles from './BoardFilter.module.scss';

interface BoardListFilterForm extends Omit<BoardListFilter, 'category'> {
  category: BoardListFilter['category'] | 'all';
}

const CATEGORY_OPTIONS = [{value: 'all', label: '전체'}, ...BOARD_CATEGORIES.items];

export default function BoardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = safeParsePartial(boardListFilterSchema, queryString.parse(searchParams.toString()));

  const {control, handleSubmit, reset} = useForm<BoardListFilterForm>({
    defaultValues: {
      ...DEFAULT_FILTER,
      ...parsed,
      boardType: parsed.boardType ?? BOARD_TYPES.values,
    },
  });

  const onSubmit = (data: BoardListFilterForm) => {
    const isAllTypes = BOARD_TYPES.values.every((type) => data.boardType.includes(type));
    router.push(
      buildUrlWithQuery({
        pathname: DEFAULT_URL,
        params: {
          ...data,
          boardType: isAllTypes ? undefined : data.boardType,
          category: data.category === 'all' ? undefined : data.category,
        },
      }),
    );
  };

  const handleReset = () => {
    reset(DEFAULT_FILTER);
    router.push(DEFAULT_URL);
  };

  return (
    <Card className={styles.filterCard}>
      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className={styles.formCol}>
          <Controller
            control={control}
            name="postTitle"
            render={({field}) => (
              <TextField
                {...field}
                label="검색"
                leading={<MagnifyingGlassIcon />}
                placeholder="제목 검색"
                value={field.value}
              />
            )}
          />

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <Label>타입</Label>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <div className={styles.checkGroup}>
                    <Checkbox
                      checked={BOARD_TYPES.values.every((type) => field.value.includes(type))}
                      onChange={(event) => field.onChange(event.target.checked ? BOARD_TYPES.values : [])}
                    >
                      전체
                    </Checkbox>
                    {BOARD_TYPES.items.map(({value, label}) => (
                      <Checkbox
                        key={value}
                        checked={field.value.includes(value)}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...field.value, value]
                            : field.value.filter((type) => type !== value);
                          field.onChange(next);
                        }}
                      >
                        {label}
                      </Checkbox>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className={styles.field}>
              <Controller
                control={control}
                name="category"
                render={({field}) => (
                  <Select label="카테고리" options={CATEGORY_OPTIONS} value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          <div className={styles.field}>
            <Label>태그</Label>
            <Controller
              control={control}
              name="tagList"
              render={({field}) => (
                <div className={styles.checkGroup}>
                  {AVAILABLE_TAGS.map((tag) => (
                    <Checkbox
                      key={tag}
                      checked={field.value.includes(tag)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...field.value, tag]
                          : field.value.filter((item) => item !== tag);
                        field.onChange(next);
                      }}
                    >
                      {tag}
                    </Checkbox>
                  ))}
                </div>
              )}
            />
          </div>

          <div className={styles.actions}>
            <Button color="secondary" size="medium" type="button" variant="outlined" onClick={handleReset}>
              초기화
            </Button>
            <Button size="medium" type="submit">
              검색
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}

const DEFAULT_FILTER: BoardListFilterForm = {
  postTitle: '',
  boardType: BOARD_TYPES.values,
  category: 'all',
  tagList: [],
};

const DEFAULT_URL = '/validation/integration';

const AVAILABLE_TAGS = ['React', 'Next.js', 'TypeScript', 'TanStack', 'Radix', 'Zod'];
