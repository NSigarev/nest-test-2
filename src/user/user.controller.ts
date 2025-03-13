import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Param,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { email, login, password } = registerUserDto;
    return this.usersService.createUser(email, login, password);
  }

  @Public()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { login, password } = loginUserDto;
    const user = await this.usersService.findOneByLogin(login);
    if (user && (await user.validatePassword(password))) {
      return this.authService.generateToken(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }
  @Get('profile')
  async getProfile(@Param('id') id: string) {
    return 'haha scumed';
  }
}
