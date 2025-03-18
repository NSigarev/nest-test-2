import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async findAll(): Promise<Article[]> {
    return this.articleRepository.find();
  }

  async findWhere(opt: FindManyOptions<Article>) {
    return this.articleRepository.find(opt);
  }

  async findByTags(tags: string[], user: User | null): Promise<Article[]> {
    return this.articleRepository.find({
      where: {
        tags: Raw((alias) => `${alias} && ARRAY[:...tags]`, { tags }),
      },
    });
  }

  async findOne(id: number): Promise<Article | null> {
    return this.articleRepository.findOne({ where: { id } });
  }

  async create(article: Partial<Article>, author: User): Promise<Article> {
    const newArticle = this.articleRepository.create({ ...article, author });
    return this.articleRepository.save(newArticle);
  }

  async update(
    id: number,
    article: Partial<Article>,
    author: User,
  ): Promise<Article> {
    const existingArticle = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!existingArticle) {
      throw new Error('Article not found');
    } else if (existingArticle.authorId !== author.id) {
      throw new ForbiddenException('You are not the author of this article');
    }
    Object.assign(existingArticle, article);
    return await this.articleRepository.save(existingArticle);
  }

  async delete(id: number, author: User): Promise<void> {
    const existingArticle = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (existingArticle.author?.id !== author.id) {
      throw new ForbiddenException('You are not the author of this article');
    }

    await this.articleRepository.delete(id);
  }
}
