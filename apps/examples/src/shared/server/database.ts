import {ServerBoardDto} from '@/app/api/board/dto';
import rawData from '@/shared/server/database/board.json';

const REPEAT_COUNT = 25;

function generateBoards(): ServerBoardDto[] {
  const boards: ServerBoardDto[] = [];
  for (let round = 0; round < REPEAT_COUNT; round++) {
    for (const raw of rawData.list) {
      boards.push({
        ...raw,
        id: raw.id + round * rawData.list.length,
        post_title: `${raw.post_title} (${round + 1})`,
        tag_list: raw.tag_list.length === 0 ? null : raw.tag_list,
      });
    }
  }
  return boards;
}

interface BoardTable {
  list: ServerBoardDto[];
}

let boardStore: BoardTable = { list: generateBoards() };

const database = {
  board: {
    get: function getBoard(): Promise<BoardTable> {
      return Promise.resolve(boardStore);
    },
    set: async function setBoard(board: BoardTable): Promise<void> {
      boardStore = board;
    },
  },
};

export default database;
