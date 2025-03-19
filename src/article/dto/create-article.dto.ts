import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateArticleDto {
  @ApiProperty({
    description: 'Title of the article',
    example: 'Introduction to NestJS',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Description of the article',
    example: 'NestJS is a framework.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Content of the article',
    example: 'NestJS is a framework for building efficient, scalable Node.js applications.',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Tags associated with the article',
    example: ['NestJS', 'Backend', 'TypeScript'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Whether the article is public or not',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
