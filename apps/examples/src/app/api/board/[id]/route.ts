import {NextRequest, NextResponse} from 'next/server';
import database from '@/shared/server/database';

type RouteContext = {params: Promise<{id: string}>};

export async function GET(_request: NextRequest, {params}: RouteContext) {
  const {id} = await params;
  const {list} = await database.board.get();
  const board = list.find(item => item.id === Number(id));

  if (!board) {
    return NextResponse.json({message: 'Not Found'}, {status: 404});
  }
  return NextResponse.json({...board, tag_list: !board.tag_list?.length ? null : board.tag_list});
}

export async function PATCH(request: NextRequest, {params}: RouteContext) {
  const {id} = await params;
  const body = await request.json();
  const {list} = await database.board.get();
  const index = list.findIndex(item => item.id === Number(id));

  if (index === -1) {
    return NextResponse.json({message: 'Not Found'}, {status: 404});
  }

  list[index] = {...list[index], ...body};
  await database.board.set({list});
  const updated = list[index];
  return NextResponse.json({...updated, tag_list: !updated.tag_list?.length ? null : updated.tag_list});
}

export async function DELETE(_request: NextRequest, {params}: RouteContext) {
  const {id} = await params;
  const {list} = await database.board.get();
  const filtered = list.filter(item => item.id !== Number(id));

  if (filtered.length === list.length) {
    return NextResponse.json({message: 'Not Found'}, {status: 404});
  }

  await database.board.set({list: filtered});
  return new Response(null, {status: 204});
}
