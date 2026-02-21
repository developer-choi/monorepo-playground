import {getBoardApi} from '@/validation/integration/api';
import {parseNumericId} from '@/shared/schema/params';
import {handleServerSideError} from '@/shared/error/handler/server';
import BoardDetail from '@/validation/integration/components/BoardDetail';

export default async function Page({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const board = await getBoardApi(parseNumericId(id));
    return <BoardDetail board={board} />;
  } catch (error) {
    return handleServerSideError(error);
  }
}
