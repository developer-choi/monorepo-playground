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
    filtered = filtered.filter(item => item.post_title.includes(postTitle));
  }
  const boardTypes = sp.getAll('board_type');
  if (boardTypes.length > 0) {
    filtered = filtered.filter(item => boardTypes.includes(item.board_type));
  }
  const category = sp.get('category');
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }
  const tagList = sp.getAll('tag_list');
  if (tagList.length > 0) {
    filtered = filtered.filter(item =>
      tagList.some(tag => item.tag_list?.includes(tag)),
    );
  }

  // 페이지네이션
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 10));
  const total = filtered.length;
  const total_pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const response: ServerBoardListResponseDto = {
    list: paged.map((item) => ({...item, tag_list: !item.tag_list?.length ? null : item.tag_list})),
    pagination_meta: {total, page, limit, total_pages},
  };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {list} = await database.board.get();
  const nextId = list.length === 0 ? 1 : Math.max(...list.map(item => item.id)) + 1;

  const newItem = {id: nextId, ...body};
  list.push(newItem);
  await database.board.set({list});

  return NextResponse.json(newItem, {status: 201});
}
