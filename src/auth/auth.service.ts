import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { User } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenContent } from './types/token';

@Injectable()
export class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(
    email: string,
    login: string,
    password: string,
  ): Promise<User | null> {
    const loginUser = await this.userRepository.findOne({
      where: { login: login },
    });
    if (loginUser) {
      throw new ConflictException('login in use');
    }
    const mailUser = await this.userRepository.findOne({
      where: { email: email },
    });
    if (mailUser) {
      throw new ConflictException('mail in use');
    }
    const user = new User();
    user.email = email;
    user.login = login;
    await user.setPassword(password);
    const res = await this.userRepository.save(user);
    return this.userRepository.findOne({ where: { id: res.id } });
  }

  generateToken(user: TokenContent): { access_token: string } {
    const payload = { login: user.login, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
