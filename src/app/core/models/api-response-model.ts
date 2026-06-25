export interface PagedResponse<T> {
  products?: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

export interface UploadProgress {
  type: 'progress' | 'complete' | 'error';
  percent?: number;
  result?: any;
  error?: string;
}