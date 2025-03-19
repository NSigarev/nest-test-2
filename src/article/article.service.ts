import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { FindManyOptions, Raw, Repository, SelectQueryBuilder } from "typeorm";
import { User } from '../user/entity/user.entity';
import { a, an } from "@faker-js/faker/dist/airline-CBNP41sR";
import { FindOptionField, FindOptionsOperator, FindOptionsType, SetFindAllOptions } from "../common";

@Injectable()
export class ArticleService {
  static allowedStrings = [
    'article.title',
    'author.login',
    'article.tags',
    'article.content',
    'article.created_at',
    'article.description',
  ] as const;

  static get findOptions(): Partial<
    Record<(typeof ArticleService.allowedStrings)[number], FindOptionField>
  > {
    return ArticleService.allowedStrings.reduce((acc, key) => {
      acc[key] = {
        value: undefined,
        type: FindOptionsType.String,
        operator: FindOptionsOperator.Equal,
      };
      return acc;
    }, {} as Record<(typeof ArticleService.allowedStrings)[number], FindOptionField>);
  }
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

  async getArticles(opt: typeof ArticleService.findOptions, pagination?: { page?: number; page_size?: number }): Promise<Article[]> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoin('user', 'author', 'author.id = article.authorId');
    SetFindAllOptions(qb, opt);
    if (pagination) {
      const toLoad = (await this.getIds(qb)).slice(
        ((pagination.page ?? 1) - 1) * (pagination.page_size ?? 20),
        (pagination.page ?? 1) * (pagination.page_size ?? 20),
      );
      qb.andWhereInIds(toLoad);
    }
    return qb.getMany();
  }
  private async getIds(qb: SelectQueryBuilder<Article>) {
    const sqb = qb.clone().select('article.id', 'id');
    const res = await sqb.getRawMany<{ id: number }>();
    return [...new Set(res.map((x) => x.id))];
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
