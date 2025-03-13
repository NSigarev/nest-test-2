// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "./entity/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(email: string, login: string, password: string): Promise<User> {
    const user = new User();
    user.email = email;
    user.login = login;
    await user.setPassword(password);
    return this.usersRepository.save(user);
  }

  async findOneByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { login } });
  }
}
