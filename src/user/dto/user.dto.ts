import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
  @ApiProperty({ example: 'john_doe', description: 'User login' })
  @IsNotEmpty()
  @IsString()
  login!: string;
  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class LoginUserDto {
  @ApiProperty({ example: 'john_doe', description: 'User login' })
  @IsNotEmpty()
  @IsString()
  login!: string;
  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
