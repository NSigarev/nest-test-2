import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginUserDto, RegisterUserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // Описание операции
  @ApiBody({ type: RegisterUserDto }) // Указываем тип тела запроса
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    const { email, login, password } = registerUserDto;
    return this.authService.createUser(email, login, password);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' }) // Описание операции
  @ApiBody({ type: LoginUserDto }) // Указываем тип тела запроса
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginUserDto) {
    const { login, password } = loginUserDto;
    const user = await this.userService.findOneByLogin(login);
    if (user && (await user.validatePassword(password))) {
      return this.authService.generateToken(user);
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
