export interface PagedResponse<T> {
  [key: string]: any;
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