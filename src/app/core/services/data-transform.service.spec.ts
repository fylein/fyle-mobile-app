import { TestBed } from '@angular/core/testing';
import { DataTransformService } from './data-transform.service';
import { flattenedData, unflattenedData } from '../mock-data/data-transform.data';

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

  describe('unflatten():', () => {
    it('should unflatten the data', () => {
      const actualOutput = dataTransformService.unflatten(flattenedData);
      expect(actualOutput).toEqual(unflattenedData);
    });

    it('should return an empty object if input is empty', () => {
      const input = {};
      const expectedOutput = {};
      const actualOutput = dataTransformService.unflatten(input);
      expect(actualOutput).toEqual(expectedOutput);
    });
  });
});
