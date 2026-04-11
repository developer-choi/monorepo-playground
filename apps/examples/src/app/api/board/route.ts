/* eslint-disable @typescript-eslint/naming-convention */
import {NextRequest, NextResponse} from 'next/server';
import database from '@/shared/server/database';
import {ServerBoardListResponseDto} from '@/app/api/board/dto';

export async function GET(request: NextRequest) {
  const {list} = await database.board.get();
  const sp = request.nextUrl.searchParams;

  // 필터
  let filtered = list;
  const postTitle = sp.get('post_title');
  if (postTitle) {
    filtered = filtered.filter((item) => item.post_title.includes(postTitle));
  }
  const boardTypes = sp.getAll('board_type');
  if (boardTypes.length > 0) {
    filtered = filtered.filter((item) => boardTypes.includes(item.board_type));
  }
  const category = sp.get('category');
  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }
  const tagList = sp.getAll('tag_list');
  if (tagList.length > 0) {
    filtered = filtered.filter((item) => tagList.some((tag) => item.tag_list?.includes(tag)));
  }

  // 정렬 (최신순)
  filtered = filtered.toSorted(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );

  // 페이지네이션
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, Number(sp.get('limit')) || DEFAULT_PAGE_LIMIT));
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const response: ServerBoardListResponseDto = {
    list: paged.map((item) => ({...item, tag_list: !item.tag_list?.length ? null : item.tag_list})),
    pagination_meta: {total, page, limit, total_pages: totalPages},
  };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument -- TODO: API body를 zod 등으로 검증하여 disable 제거 */
  const body = await request.json();
  const {list} = await database.board.get();
  const nextId = list.length === 0 ? 1 : Math.max(...list.map((item) => item.id)) + 1;

  const newItem = {id: nextId, created_at: new Date().toISOString().slice(0, DATE_ONLY_LENGTH), ...body};
  list.push(newItem);
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument -- TODO: API body를 zod 등으로 검증하여 disable 제거 */
  await database.board.set({list});

  return NextResponse.json(newItem, {status: 201});
}

const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 10;
const DATE_ONLY_LENGTH = 10;
