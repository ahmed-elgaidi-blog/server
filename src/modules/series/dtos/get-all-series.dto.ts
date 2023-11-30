import { Pagination } from '@src/shared/dtos'

export class GetAllSeriesQuery {
  isPublished?: boolean
}

export class GetAllSeriesDto extends GetAllSeriesQuery {
  pagination: Pagination
  sortCondition?: string | { [key: string]: 1 | -1 }
  sortValue?: number
}
