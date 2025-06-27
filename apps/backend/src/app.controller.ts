import { Controller, Get, Post, Body, Req, Redirect } from '@nestjs/common';
import { debug } from 'console';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('/api', 301)
  home(): string {
    return this.appService.getHello();
  }
}
