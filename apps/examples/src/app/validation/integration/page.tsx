import {Container, Heading, Button, Flex} from '@radix-ui/themes';
import Link from 'next/link';
import {PlusIcon} from '@radix-ui/react-icons';
import {getBoardListApi} from '@/validation/integration/api';
import {BoardListFilterSchema} from '@/validation/integration/schema';
import {PaginationParamsSchema} from '@/shared/schema/pagination';
import {safeParsePartial} from '@/shared/utils/zod';
import BoardFilter from '@/validation/integration/components/BoardFilter';
import BoardTable from '@/validation/integration/components/BoardTable';

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({searchParams}: PageProps) {
  const query = await searchParams;
  const filters = safeParsePartial(BoardListFilterSchema, query);
  const pagination = safeParsePartial(PaginationParamsSchema, query);
  const data = await getBoardListApi({...filters, ...pagination});

  return (
    <Container size="3" p="6">
      <Flex justify="between" align="center" mb="5">
        <Heading size="7">게시판</Heading>
        <Button size="2" asChild>
          <Link href="/validation/integration/create"><PlusIcon /> 새 글 작성</Link>
        </Button>
      </Flex>
      <BoardFilter />
      <BoardTable data={data} />
    </Container>
  );
}
