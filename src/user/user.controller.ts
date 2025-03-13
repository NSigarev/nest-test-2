import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('profile/:id')
  @ApiBearerAuth() // Указываем, что метод требует авторизации
  @ApiOperation({ summary: 'Get user profile by ID' }) // Описание операции
  @ApiParam({ name: 'id', description: 'User ID', type: String }) // Описание параметра
  @ApiResponse({
    status: 200,
    description: 'User profile data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Param('id') id: string) {
    return 'haha scumed' + id;
  }
}
