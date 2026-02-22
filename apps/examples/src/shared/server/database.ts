import {ServerBoardDto} from '@/app/api/board/dto';
import initialBoardData from '@/shared/server/database/board.json';
import rawProducts from '@/shared/server/database/product.json';
import type {Product} from '@/shared/product/type';

const database = {
  board: {
    get: function getBoard(): Promise<BoardTable> {
      return Promise.resolve(boardStore);
    },
    set: async function setBoard(board: BoardTable): Promise<void> {
      boardStore = board;
    },
  },
  product: {
    get: function getProducts(): Promise<Product[]> {
      return Promise.resolve(productStore);
    },
  },
};

interface BoardTable {
  list: ServerBoardDto[];
}

interface RawProduct {
  code: string;
  name: string;
  brandName: string;
  brandId: number;
  price: {original: number; final: number};
  imageUrl: string;
}

const REPEAT_COUNT = 5;

function generateProducts(): Product[] {
  const products: Product[] = [];
  for (let round = 0; round < REPEAT_COUNT; round++) {
    for (const raw of rawProducts as RawProduct[]) {
      products.push({
        code: `${raw.code}_${round + 1}`,
        name: `${raw.name} (${round + 1})`,
        brand: {id: raw.brandId, name: raw.brandName},
        price: {...raw.price},
        imageUrl: raw.imageUrl,
      });
    }
  }
  return products;
}

let boardStore: BoardTable = initialBoardData;
const productStore: Product[] = generateProducts();

export default database;
