import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
  @IsNotEmpty()
  @IsString()
  login!: string;
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsString()
  login!: string;
  @IsNotEmpty()
  @IsString()
  password!: string;
}
