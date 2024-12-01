type GlobalReturn<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
};

type Dto<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type { GlobalReturn, Dto };
