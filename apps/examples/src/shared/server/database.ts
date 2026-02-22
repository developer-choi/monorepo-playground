import {ServerBoardDto} from '@/app/api/board/dto';
import initialData from '@/shared/server/database/board.json';

interface BoardTable {
  list: ServerBoardDto[];
}

let boardStore: BoardTable = initialData;

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
