import { Test, TestingModule } from '@nestjs/testing';
import { ObservationTypeController } from './observation-type.controller';

describe('ObservationTypeController', () => {
  let controller: ObservationTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObservationTypeController],
    }).compile();

    controller = module.get<ObservationTypeController>(ObservationTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
