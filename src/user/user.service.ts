import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from "typeorm";
import { User } from './entity/user.entity';
import { th } from "@faker-js/faker";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(opt: FindOneOptions<User>): Promise<User> {
    const res = await this.userRepository.findOne(opt);
    if (!res) {
      throw new NotFoundException();
    }
    return res;
  }
  async findOneByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { login: login } });
  }
  async findForAuth(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { login: login },
      select: ['email', 'login', 'passwordHash', 'id'],
    });
  }

  async delete(id: number, user: User): Promise<void> {
    const requestedUser = await this.userRepository.findOne({ where: { id } });
    if (!requestedUser || requestedUser.id !== user.id) {
      throw new ForbiddenException('You cannot delete this user');
    }
    await this.userRepository.delete(user.id);
  }
}
