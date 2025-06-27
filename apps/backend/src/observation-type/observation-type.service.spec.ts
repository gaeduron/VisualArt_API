import { Test, TestingModule } from '@nestjs/testing';
import { ObservationTypeService } from './observation-type.service';

describe('ObservationTypeService', () => {
  let service: ObservationTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservationTypeService],
    }).compile();

    service = module.get<ObservationTypeService>(ObservationTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
