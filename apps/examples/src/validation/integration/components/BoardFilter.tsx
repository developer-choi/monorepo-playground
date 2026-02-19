'use client';

import {useForm, Controller} from 'react-hook-form';
import {Box, Button, Card, Checkbox, Flex, Select, Text, TextField} from '@radix-ui/themes';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {useRouter, useSearchParams} from 'next/navigation';
import queryString from 'query-string';
import {safeParsePartial} from '@/shared/utils/zod';
import {buildUrlWithQuery} from '@/shared/utils/url';
import {BoardListFilter, BoardListFilterSchema, BOARD_CATEGORIES, BOARD_TYPES} from '@/validation/integration/schema';

interface BoardListFilterForm extends Omit<BoardListFilter, 'category'> {
  category: BoardListFilter['category'] | 'all';
}

export default function BoardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = safeParsePartial(BoardListFilterSchema, queryString.parse(searchParams.toString()));

  const {control, handleSubmit, reset} = useForm<BoardListFilterForm>({
    defaultValues: {
      ...DEFAULT_FILTER,
      ...parsed,
      boardType: parsed.boardType ?? BOARD_TYPES.values,
    },
  });

  const onSubmit = (data: BoardListFilterForm) => {
    const isAllTypes = BOARD_TYPES.values.every(t => data.boardType.includes(t));
    router.push(buildUrlWithQuery(DEFAULT_URL, {
      ...data,
      boardType: isAllTypes ? undefined : data.boardType,
      category: data.category === 'all' ? undefined : data.category,
    }));
  };

  const handleReset = () => {
    reset(DEFAULT_FILTER);
    router.push(DEFAULT_URL);
  };

  return (
    <Card variant="surface" mb="5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>검색</Text>
            <Controller
              control={control}
              name="postTitle"
              render={({field}) => (
                <TextField.Root {...field} value={field.value} placeholder="제목 검색" size="2">
                  <TextField.Slot>
                    <MagnifyingGlassIcon />
                  </TextField.Slot>
                </TextField.Root>
              )}
            />
          </Box>

          <Flex gap="6" wrap="wrap">
            <Box style={{flex: 1, minWidth: 200}}>
              <Text size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>타입</Text>
              <Controller
                control={control}
                name="boardType"
                render={({field}) => (
                  <Flex gap="3" wrap="wrap">
                    <Text as="label" size="2">
                      <Flex gap="2" align="center">
                        <Checkbox
                          checked={BOARD_TYPES.values.every(t => field.value.includes(t))}
                          onCheckedChange={checked => field.onChange(checked ? BOARD_TYPES.values : [])}
                        />
                        전체
                      </Flex>
                    </Text>
                    {BOARD_TYPES.items.map(({value, label}) => (
                      <Text as="label" size="2" key={value}>
                        <Flex gap="2" align="center">
                          <Checkbox
                            checked={field.value.includes(value) ?? false}
                            onCheckedChange={checked => {
                              const next = checked
                                ? [...(field.value ?? []), value]
                                : (field.value ?? []).filter(t => t !== value);
                              field.onChange(next);
                            }}
                          />
                          {label}
                        </Flex>
                      </Text>
                    ))}
                  </Flex>
                )}
              />
            </Box>

            <Box style={{flex: 1, minWidth: 200}}>
              <Text as="div" size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>카테고리</Text>
              <Controller
                control={control}
                name="category"
                render={({field}) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger placeholder="전체" />
                    <Select.Content>
                      <Select.Item value="all">전체</Select.Item>
                      {BOARD_CATEGORIES.items.map(({value, label}) => (
                        <Select.Item key={value} value={value}>{label}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                )}
              />
            </Box>
          </Flex>

          <Box>
            <Text size="2" weight="medium" style={{display: 'block', marginBottom: 6}}>태그</Text>
            <Controller
              control={control}
              name="tagList"
              render={({field}) => (
                <Flex gap="3" wrap="wrap">
                  {AVAILABLE_TAGS.map(tag => (
                    <Text as="label" size="2" key={tag}>
                      <Flex gap="2" align="center">
                        <Checkbox
                          checked={field.value.includes(tag) ?? false}
                          onCheckedChange={checked => {
                            const next = checked
                              ? [...(field.value ?? []), tag]
                              : (field.value ?? []).filter(t => t !== tag);
                            field.onChange(next);
                          }}
                        />
                        {tag}
                      </Flex>
                    </Text>
                  ))}
                </Flex>
              )}
            />
          </Box>

          <Flex gap="2" justify="end">
            <Button type="button" variant="soft" color="gray" size="2" onClick={handleReset}>초기화</Button>
            <Button type="submit" size="2">검색</Button>
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