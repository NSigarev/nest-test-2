import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from './entity/article.entity';
import { Between, FindManyOptions, Raw, Repository, SelectQueryBuilder } from "typeorm";
import { User } from '../user/entity/user.entity';
import { FindOptionField, FindOptionsOperator, FindOptionsType, SetFindAllOptions } from "../common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';

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
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {
    this.test();
  }

  async test() {
    const art = await this.articleRepository.findOne({where: {
      authorId: Between(0, 100),
      }})
    if (!art) {return;}
    const cacheKey = `article:${art.id}`;
    await this.cacheManager.set(cacheKey, art, 60 * 1000);
    const aaa = await this.cacheManager.get<Article>(cacheKey);
    console.log(aaa);
  }

  async findAll(): Promise<Article[]> {
    const res = await this.articleRepository.find();
    res.forEach(article => {
      const cacheKey = `article:${article.id}`;
      this.cacheManager.set(cacheKey, article, 60 * 1000);
    })
    return res;
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
    const idList = await this.getIds(qb);
    const res: Article[] = [];
    if (pagination) {
      idList.splice(
        ((pagination.page ?? 1) - 1) * (pagination.page_size ?? 20),
        (pagination.page ?? 1) * (pagination.page_size ?? 20),
      );
    }
    const stillNotFound: number[] = [];
    await Promise.all(idList.map(async (r) => {
      const loaded = await this.cacheManager.get<Article>(`article:${r}`);
      if (loaded) {
        res.push(loaded);
      } else stillNotFound.push(r);
    }))
    qb.andWhereInIds(stillNotFound);
    const tmpRes = await qb.getMany();
    res.concat(tmpRes);
    tmpRes.forEach(article => {
      const cacheKey = `article:${article.id}`;
      this.cacheManager.set(cacheKey, article, 60 * 1000);
    })
    return res;
  }
  private async getIds(qb: SelectQueryBuilder<Article>) {
    const sqb = qb.clone().select('article.id', 'id');
    const res = await sqb.getRawMany<{ id: number }>();
    return [...new Set(res.map((x) => x.id))];
  }
  async findOne(id: number): Promise<Article | null> {
    const available = await this.cacheManager.get<Article>(`article:${id}`)
    const res =  available ?? await this.articleRepository.findOne({ where: { id } });
    if (res) await this.cacheManager.set<Article>(`article:${id}`, res);
    return res;
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
    const res = await this.articleRepository.save(existingArticle);
    await this.cacheManager.del(`article:${res.id}`);
    return res;
  }

  async delete(id: number, author: User){
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
    await this.cacheManager.del(`article:${id}`);
  }
}
