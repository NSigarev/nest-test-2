import { Module } from '@nestjs/common';
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from './entity/article.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    CacheModule.register()],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {}
