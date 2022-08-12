import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObservationTypeModule } from './observation-type/observation-type.module';

@Module({
  imports: [ObservationTypeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
