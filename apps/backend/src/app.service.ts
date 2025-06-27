import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to this API.<br><br>Go to <a href="/api">/api</a> to see the list of endpoints';
  }
}
