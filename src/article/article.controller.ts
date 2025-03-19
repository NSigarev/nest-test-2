import {
  Body,
  Controller,
  Delete,
  Get, HttpCode,
  Param,
  Post,
  Put, Query
} from "@nestjs/common";
import { ArticleService } from './article.service';
import { Article } from './entity/article.entity';
import { User } from '../user/entity/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateArticleDto } from "./dto/create-article.dto";
import { FindOptionsOperator, FindOptionsType, ValidateFields } from "../common";
import { PaginationQueryDto } from "../commonDto/pagination.dto";

@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Public()
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({
    status: 200,
    description: 'List of articles',
    type: Article,
    isArray: true,
  })
  async findAll(@GetUser() user: User | null): Promise<Article[]> {
    if (user) return this.articleService.findAll();
    else
      return this.articleService.findWhere({
        where: {
          isPublic: true,
        },
      });
  }

  @Public()
  @Post('/search')
  @ApiBody({
    schema: {
      type: 'object',
      properties: ArticleService.findOptions,
      example: {
        'article.title': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
        'author.login': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
        'article.tags': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
        'article.content': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
        'article.created_at': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
        'article.description': {operator: FindOptionsOperator.Equal, type: FindOptionsType.Any, value: 'string'},
      }
    },
    description: 'Фильтрация статей по поддерживаемым параметрам',
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Номер страницы (начиная с 1)' })
  @ApiQuery({ name: 'page_size', required: false, description: 'Количество элементов на странице' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get articles with filters' })
  @ApiResponse({
    status: 201,
    description: 'List of articles',
    type: Article,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  async searchArticles(
    @Query() query: PaginationQueryDto, @Body() @ValidateFields(ArticleService.allowedStrings) filters: typeof ArticleService.findOptions) {
    return this.articleService.getArticles(filters, query);
  }

  @Public()
  @ApiBearerAuth()
  @Get('filter-by-tags')
  @ApiOperation({ summary: 'Get articles filtered by tags' })
  @ApiQuery({
    name: 'tags',
    description: 'Comma-separated list of tags',
    example: 'NestJS,TypeScript',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of articles filtered by tags',
    type: Article,
    isArray: true,
  })
  async findByTags(
    @Query('tags') tags: string,
    @GetUser() user: User | null,
  ): Promise<Article[]> {
    const tagsArray = tags.split(',').map((tag) => tag.trim()); // Преобразуем строку в массив тегов
    return this.articleService.findByTags(tagsArray, user);
  }

  @Public()
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article found', type: Article })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findOne(
    @Param('id') id: number,
    @GetUser() user: User | null,
  ): Promise<Article | null> {
    if (user) return this.articleService.findOne(id);
    else {
      const res = await this.articleService.findWhere({
        where: {
          isPublic: true,
          id: id,
        },
      });
      if (res && res.length > 0) return res[0];
      else return null;
    }
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({ type: CreateArticleDto, description: 'Article data' })
  @ApiResponse({ status: 201, description: 'Article created', type: Article })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() article: CreateArticleDto,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articleService.create(article, user);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  @ApiBody({ type: CreateArticleDto, description: 'Updated article data' })
  @ApiResponse({ status: 200, description: 'Article updated', type: Article })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async update(
    @Param('id') id: number,
    @Body() article: CreateArticleDto,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articleService.update(id, article, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete article by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  @ApiResponse({ status: 204, description: 'Article deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @HttpCode(204)
  async delete(@Param('id') id: number, @GetUser() user: User): Promise<void> {
    return this.articleService.delete(id, user);
  }
}
