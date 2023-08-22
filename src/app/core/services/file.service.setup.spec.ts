import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { DateService } from './date.service';
import { TestCases1 } from './file-1.service.spec';

import { FileService } from './file.service';
import { TestCases2 } from './file-2.service.spec';

fdescribe('FileService', () => {
  const getTestBed = () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'delete']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates']);
    TestBed.configureTestingModule({
      providers: [
        FileService,
        {
          provide: ApiService,
          useValue: apiServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
      ],
    });

    return TestBed;
  };

  TestCases2(getTestBed);
  TestCases1(getTestBed);
});
