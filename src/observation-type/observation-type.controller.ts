import { Controller, Get } from '@nestjs/common';
import { ObservationTypeService } from './observation-type.service';


@Controller('observation-type')
export class ObservationTypeController {
  constructor(private readonly observationTypeService: ObservationTypeService) {}

  @Get()
  findAll() {
    return this.observationTypeService.findAll();
  }
}
