import { Injectable } from '@nestjs/common';
import { ObservationTypeModule } from './observation-type.module';
import { ObservationType } from './entities/observation-type.entity'

@Injectable()
export class ObservationTypeService {
  private observationTypes: ObservationType[] = [
    {
      name: "default",
      imageUrl: "",
      generationSetting: "9-c",
      generated: true,
    },
    {
      name: "straight",
      imageUrl: "",
      generationSetting: "9-l",
      generated: true,
    },
    {
      name: "complex",
      imageUrl: "",
      generationSetting: "9-s",
      generated: true,
    }
  ];

  public findAll(): ObservationType[] {
    return this.observationTypes
  };
}
