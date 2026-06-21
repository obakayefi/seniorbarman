import { Model, FilterQuery } from 'mongoose';

export interface PaginationOptions {
  page?: number | string | null;
  limit?: number | string | null;
  sort?: any;
  populate?: string | any[];
  select?: string | any;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Helper to paginate MongoDB queries using Mongoose models
 */
export async function paginate<T>(
  model: Model<T>,
  query: FilterQuery<T> = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 5);
  const skip = (page - 1) * limit;

  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  let queryBuilder = model.find(query).skip(skip).limit(limit);

  if (options.sort) {
    queryBuilder = queryBuilder.sort(options.sort);
  }

  if (options.populate) {
    queryBuilder = queryBuilder.populate(options.populate);
  }

  if (options.select) {
    queryBuilder = queryBuilder.select(options.select);
  }

  const data = await queryBuilder.lean() as T[];

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Helper to paginate arrays directly (useful when post-query filtering is applied)
 */
export function paginateArray<T>(
  items: T[],
  options: PaginationOptions = {}
): PaginatedResult<T> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 5);
  const skip = (page - 1) * limit;

  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;

  const data = items.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
