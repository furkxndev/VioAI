export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}

export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error: string
  path: string
  timestamp: string
}
