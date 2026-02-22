export interface Brand {
  id: number;
  name: string;
}

export interface ProductPrice {
  final: number; // 최종가 (할인포함)
  original: number; // 원가
}

export interface Product {
  code: string;
  name: string;
  brand: Brand;
  price: ProductPrice;
  imageUrl: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
}
