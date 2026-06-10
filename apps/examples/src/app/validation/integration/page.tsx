import {Container, Flex} from '@radix-ui/themes';
import Link from 'next/link';
import {PlusIcon} from '@radix-ui/react-icons';
import {Button} from '@monorepo-playground/design-system';
import typography from '@monorepo-playground/design-system/styles/typography';
import {getBoardListApi} from '@/validation/integration/api';
import {boardListFilterSchema} from '@/validation/integration/schema';
import {paginationParamsSchema} from '@/shared/schema/pagination';
import {safeParsePartial} from '@/shared/utils/zod';
import BoardFilter from '@/validation/integration/components/BoardFilter';
import BoardTable from '@/validation/integration/components/BoardTable';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({searchParams}: PageProps) {
  const query = await searchParams;
  const filters = safeParsePartial(boardListFilterSchema, query);
  const pagination = safeParsePartial(paginationParamsSchema, query);
  const data = await getBoardListApi({...filters, ...pagination});

  return (
    <Container p="6" size="3">
      <Flex align="center" justify="between" mb="5">
        <h2 className={typography.h2}>게시판</h2>
        <Button asChild size="medium">
          <Link href="/validation/integration/create">
            <PlusIcon /> 새 글 작성
          </Link>
        </Button>
      </Flex>
      <BoardFilter />
      <BoardTable data={data} />
    </Container>
  );
}
