import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ArticlesService } from './article.service';
import { Article } from './entity/article.entity';
import { User } from '../user/entity/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  async findAll(@GetUser() user: User | null): Promise<Article[]> {
    if (user) return this.articlesService.findAll();
    else
      return this.articlesService.findWhere({
        where: {
          isPublic: true,
        },
      });
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @GetUser() user: User | null,
  ): Promise<Article | null> {
    if (user) return this.articlesService.findOne(id);
    else {
      const res = await this.articlesService.findWhere({
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
  async create(
    @Body() article: Partial<Article>,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articlesService.create(article, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() article: Partial<Article>,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articlesService.update(id, article, user);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() user: User): Promise<void> {
    return this.articlesService.delete(id, user);
  }
}
