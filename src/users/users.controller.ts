import { Controller, Post, Body, Get} from '@nestjs/common';
import { UserService } from './users.service'
import { User } from './entities/users.entity'
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): string {
    if (createUserDto['email'] && createUserDto['password']) {
      return this.userService.addOne({email: createUserDto['email'], password: createUserDto['password']})
      // return `Hello ${createUserDto['email']} your account as been created.
      //         <br><br>
      //         You can connect on /user/login with:<br>{ "email": string, "password": string }`
    }
    return `To create an account please send:<br>{ "email": string, "password": string }`
  }

  @Post('login')
  login(@Body() body: object): string {
    if (body['email'] && body['password']) {
      return `Hello ${body['email']} your are now connected`
    }
    return `To login to your account please send:<br>{ "email": string, "password": string }
      <br><br>
      Forgot you password? Go to /user/password-reset`
  }

  @Get()
  accounts(): User[] {
    return this.userService.findAll()
  }
}