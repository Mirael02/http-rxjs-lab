export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: keyof Product;
  order?: 'asc' | 'desc';
}

export type CreateProductDto = Omit<Product, 'id'>;
export type UpdateProductDto = Partial<Omit<Product, 'id'>>;