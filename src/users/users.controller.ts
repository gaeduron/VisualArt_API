import { Controller, Post, Body, Get, Patch, Delete, Param} from '@nestjs/common';
import { UserService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiParam, ApiTags} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags("user")
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.addOne(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    if (loginUserDto['email'] && loginUserDto['password']) {
      return `Hello ${loginUserDto['email']} your are now connected`
    }
    return `To login to your account please send:<br>{ "email": string, "password": string }
      <br><br>
      Forgot you password? Go to /user/password-reset`
  }

  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  @ApiParam({name: "id", type: 'string'})
  findOne(@Param() params) {
    return this.userService.findOne(params["id"])
  }

  @Patch(':id')
  @ApiParam({name: "id", type: 'string'})
  update(@Param() params, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(params["id"], updateUserDto)
  }

  @Delete(':id')
  @ApiParam({name: "id", type: 'string'})
  delete(@Param() params) {
    return this.userService.remove(params["id"])
  }
}