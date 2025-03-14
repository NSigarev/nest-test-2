import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entity/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('profile/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 200, description: 'User profile data', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne({ where: { id } });
  }

  @Delete('profile/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(204)
  async deleteProfile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.usersService.delete(id, user);
  }
}
