import {readFile, writeFile} from '@/shared/server/file';
import {ServerBoardDto} from '@/app/api/board/dto';

interface BoardTable {
  list: ServerBoardDto[];
}

const database = {
  board: {
    get: function getBoard() {
      return readFile<BoardTable>('database/board.json');
    },
    set: async function setBoard(board: BoardTable) {
      return writeFile('database/board.json', JSON.stringify(board));
    },
  },
};

export default database;
