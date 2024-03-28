import { TestBed } from '@angular/core/testing';

import { EmployeesService } from './employees.service';
import { SpenderService } from './spender.service';
import { commuteDetailsResponseData } from 'src/app/core/mock-data/commute-details-response.data';
import { of } from 'rxjs';
import { extendedOrgUserResponse } from 'src/app/core/test-data/tasks.service.spec.data';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let spenderService: jasmine.SpyObj<SpenderService>;

  beforeEach(() => {
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [{ provide: SpenderService, useValue: spenderServiceSpy }],
    });
    service = TestBed.inject(EmployeesService);
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCommuteDetails(): should return commute details', (done) => {
    spenderService.get.and.returnValue(of(commuteDetailsResponseData));

    service.getCommuteDetails(extendedOrgUserResponse).subscribe((response) => {
      expect(response).toEqual(commuteDetailsResponseData);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/employees', {
        params: {
          user_id: `eq.${extendedOrgUserResponse.us.id}`,
        },
      });
      done();
    });
  });

  it('postCommuteDetails(): should return commute details', (done) => {
    spenderService.post.and.returnValue(of({ data: commuteDetailsResponseData.data[0] }));

    service.postCommuteDetails(commuteDetailsResponseData.data[0].commute_details).subscribe((response) => {
      expect(response).toEqual({ data: commuteDetailsResponseData.data[0] });
      expect(spenderService.post).toHaveBeenCalledOnceWith('/employees/commute_details', {
        data: {
          commute_details: commuteDetailsResponseData.data[0].commute_details,
        },
      });
      done();
    });
  });
});
