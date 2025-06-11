import { TestBed } from '@angular/core/testing';
import { DataTransformService } from './data-transform.service';

describe('DataTransformService', () => {
  let dataTransformService: DataTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataTransformService],
    });
    dataTransformService = TestBed.inject(DataTransformService);
  });

  it('should be created', () => {
    expect(dataTransformService).toBeTruthy();
  });
});
