export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type PaginationOptions = {
  page?: number;
  limit?: number;
};
