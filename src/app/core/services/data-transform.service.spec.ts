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
  //   it(' should correctly unflatten a flattened object', () => {
  //     const input = {
  //       name: 'John Doe',
  //       age: 30,
  //       address_street: '123 Main St',
  //       address_city: 'Anytown',
  //       address_state: 'CA'
  //     };
  //     const expectedOutput = {
  //       name: 'John Doe',
  //       age: 30,
  //       address: {
  //         street: '123 Main St',
  //         city: 'Anytown',
  //         state: 'CA'
  //       }
  //     };
  //     const actualOutput = dataTransformService.unflatten(input);
  //     expect(actualOutput).toEqual(expectedOutput);
  //   });

  //   it('should return an empty object if input is empty', () => {
  //     const input = {};
  //     const expectedOutput = {};
  //     const actualOutput = dataTransformService.unflatten(input);
  //     expect(actualOutput).toEqual(expectedOutput);
  //   });
  // });
});
