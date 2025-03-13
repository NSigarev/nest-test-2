import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { ByTokenStrategy } from "./by-token-strategy.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('TOKEN_SECRET');
        if (!secret) {
          throw new Error(`No secret provided for token in config`);
        }
        return {
          global: true,
          secret: secret,
          secretOrPrivateKey: secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRE_TIME'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
  ],
  providers: [AuthService, ByTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
