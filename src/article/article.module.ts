import { Module } from '@nestjs/common';
import { ArticlesController } from "./article.controller";
import { ArticlesService } from "./article.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Article } from "./entity/article.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: [ArticlesService]
})
export class ArticleModule {}
