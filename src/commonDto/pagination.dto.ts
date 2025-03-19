import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be integer' })
  @Min(1, { message: 'page must be 1 or greater' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be integer' })
  @Min(1, { message: 'page must be 1 or greater' })
  page_size?: number;
}
