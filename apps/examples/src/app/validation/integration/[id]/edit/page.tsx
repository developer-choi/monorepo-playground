import {getBoardApi} from '@/validation/integration/api';
import {parseNumericId} from '@/shared/schema/params';
import BoardForm from '@/validation/integration/components/BoardForm';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const board = await getBoardApi(parseNumericId(id));
    return <BoardForm board={board} />;
  } catch (error) {
    // TODO zod error면 notFound
    // TODO api error면 status에 맞게 처리
    throw error;
  }
}
