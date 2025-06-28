import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}
export class CreateUserDto {
  @IsString()
  @ApiProperty({enum: UserRole})
  readonly email: UserRole;

  @IsString()
  @ApiProperty({
    description: 'User password',
    minLength: 12,
    maxLength: 64,
  })
  readonly password: string;
}
