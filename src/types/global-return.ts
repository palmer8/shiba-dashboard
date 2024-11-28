type GlobalReturn<T> = {
  success: boolean;
  message: string;
  data: T | null;
  error: unknown;
};

export type { GlobalReturn };
