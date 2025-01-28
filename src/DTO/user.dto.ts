import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDTO {
  @ApiProperty({ example: 'John', description: 'The first name of the User' })
  first_name: string;
  @ApiProperty({ example: 'Doe', description: 'The last name of the User' })
  last_name: string;
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the User',
  })
  email: string;
  @ApiProperty({ example: 'password', description: 'The password of the User' })
  password: string;
}

export class UserLoginDTO {
  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email of the User',
  })
  email: string;
  @ApiProperty({ example: 'password', description: 'The password of the User' })
  password: string;
}

export interface IAuthUser {
  email: string;
  sub: string;
}
