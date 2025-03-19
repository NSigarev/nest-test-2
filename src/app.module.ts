import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { ArticleModule } from './article/article.module';
import { redisStore } from "cache-manager-redis-store";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600, // Время жизни кеша в секундах (10 минут)
    }),
    ConfigModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    JwtModule,
    ArticleModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Регистрируем глобальный guard
    },
  ],
})
export class AppModule {}
