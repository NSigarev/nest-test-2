import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { TokenContent } from "./types/token";
import { User } from "../user/entity/user.entity";

@Injectable()
export class ByTokenStrategy extends PassportStrategy(Strategy, 'tokenAuthorization') {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get('TOKEN_SECRET');
    if (!secret) {
      throw new Error(`No secret provided for token in config`);
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: TokenContent): Promise<User | null> {
    return this.userService.findOneByLogin(payload.login);
  }
}
