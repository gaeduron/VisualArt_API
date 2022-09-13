import { Injectable } from '@nestjs/common';
import { User } from './entities/users.entity';

@Injectable()
export class UserService {
  private users: User[] = [{
      email: "Paul@mail.com",
      password: "azwerty",
      admin: false
  }]

  findAll() {
    return JSON.parse(JSON.stringify(this.users))
  }

  addOne(createUserDto: any) {
    this.users.push(createUserDto)
    return createUserDto
  }
}
