import { Module } from '@nestjs/common';
import { ObservationTypeController } from './observation-type.controller';
import { ObservationTypeService } from './observation-type.service';

@Module({
  imports: [],
  controllers: [ObservationTypeController],
  providers: [ObservationTypeService],
})
export class ObservationTypeModule {}
