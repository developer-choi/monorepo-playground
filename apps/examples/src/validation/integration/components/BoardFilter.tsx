'use client';

import {useForm, Controller} from 'react-hook-form';
import {Box, Card, Checkbox, Flex, Select, TextField} from '@radix-ui/themes';
import clsx from 'clsx';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import {useRouter, useSearchParams} from 'next/navigation';
import queryString from 'query-string';
import {safeParsePartial} from '@/shared/utils/zod';
import {buildUrlWithQuery} from '@/shared/utils/url';
import {BoardListFilter, boardListFilterSchema, BOARD_CATEGORIES, BOARD_TYPES} from '@/validation/integration/schema';
import styles from './BoardFilter.module.scss';

interface BoardListFilterForm extends Omit<BoardListFilter, 'category'> {
  category: BoardListFilter['category'] | 'all';
}

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
    <Card mb="5" variant="surface">
      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <Flex direction="column" gap="4">
          <Box>
            <p className={clsx(typography.body2, styles.fieldLabel)}>검색</p>
            <Controller
              control={control}
              name="postTitle"
              render={({field}) => (
                <TextField.Root {...field} placeholder="제목 검색" size="2" value={field.value}>
                  <TextField.Slot>
                    <MagnifyingGlassIcon />
                  </TextField.Slot>
                </TextField.Root>
              )}
            />
          </Box>

          <Flex gap="6" wrap="wrap">
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
            <Box style={{flex: 1, minWidth: 200}}>
              <p className={clsx(typography.body2, styles.fieldLabel)}>타입</p>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <Flex gap="3" wrap="wrap">
                    <label className={typography.body2}>
                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={BOARD_TYPES.values.every((type) => field.value.includes(type))}
                          onCheckedChange={(checked) => field.onChange(checked ? BOARD_TYPES.values : [])}
                        />
                        전체
                      </Flex>
                    </label>
                    {BOARD_TYPES.items.map(({value, label}) => (
                      <label key={value} className={typography.body2}>
                        <Flex align="center" gap="2">
                          <Checkbox
                            checked={field.value.includes(value)}
                            onCheckedChange={(checked) => {
                              const next = checked
                                ? [...field.value, value]
                                : field.value.filter((type) => type !== value);
                              field.onChange(next);
                            }}
                          />
                          {label}
                        </Flex>
                      </label>
                    ))}
                  </Flex>
                )}
              />
            </Box>

            {/* eslint-disable-next-line no-restricted-syntax -- TODO: CSS Module로 분리 필요 */}
            <Box style={{flex: 1, minWidth: 200}}>
              <div className={clsx(typography.body2, styles.fieldLabel)}>카테고리</div>
              <Controller
                control={control}
                name="category"
                render={({field}) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger placeholder="전체" />
                    <Select.Content>
                      <Select.Item value="all">전체</Select.Item>
                      {BOARD_CATEGORIES.items.map(({value, label}) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Box>
          </Flex>

          <Box>
            <p className={clsx(typography.body2, styles.fieldLabel)}>태그</p>
            <Controller
              control={control}
              name="tagList"
              render={({field}) => (
                <Flex gap="3" wrap="wrap">
                  {AVAILABLE_TAGS.map((tag) => (
                    <label key={tag} className={typography.body2}>
                      <Flex align="center" gap="2">
                        <Checkbox
                          checked={field.value.includes(tag)}
                          onCheckedChange={(checked) => {
                            const next = checked ? [...field.value, tag] : field.value.filter((item) => item !== tag);
                            field.onChange(next);
                          }}
                        />
                        {tag}
                      </Flex>
                    </label>
                  ))}
                </Flex>
              )}
            />
          </Box>

          <Flex gap="2" justify="end">
            <Button color="secondary" size="medium" type="button" variant="outlined" onClick={handleReset}>
              초기화
            </Button>
            <Button size="medium" type="submit">
              검색
            </Button>
          </Flex>
        </Flex>
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
