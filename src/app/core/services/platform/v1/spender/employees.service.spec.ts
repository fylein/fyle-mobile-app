import { TestBed } from '@angular/core/testing';

import { EmployeesService } from './employees.service';
import { SpenderService } from './spender.service';
import { commuteDetailsResponseData } from 'src/app/core/mock-data/commute-details-response.data';
import { of } from 'rxjs';
import { extendedOrgUserResponse } from 'src/app/core/test-data/tasks.service.spec.data';
import { platformEmployeeResponse } from 'src/app/core/mock-data/platform/v1/platform-employee.data';
import { PlatformEmployee } from 'src/app/core/models/platform/platform-employee.model';
import { employeesParamsRes, employeesRes } from 'src/app/core/test-data/org-user.service.spec.data';

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

  it('getByParams(): should get employees by params', () => {
    spenderService.get.and.returnValue(of(platformEmployeeResponse));
    const params: Partial<PlatformEmployee> = {
      user_id: 'usJZ9bgfNB5n',
    };

    service.getByParams(params).subscribe((res) => {
      expect(res).toBe(platformEmployeeResponse);
    });
  });

  it('getEmployeesByParams(): should be able to get employees by params', (done) => {
    spenderService.get.and.returnValue(of(employeesRes));
    const params = {
      limit: 5,
      order: 'full_name.asc',
      id: 'neq.ouX8dwsbLCLv',
      roles: 'like.%ADMIN%',
      is_enabled: 'eq.true',
      has_accepted_invite: 'eq.true',
      select: 'full_name,email',
    };
    service.getEmployeesByParams(params).subscribe((res) => {
      expect(res).toEqual(employeesRes);
      expect(spenderService.get).toHaveBeenCalledWith('/employees', { params });
      done();
    });
  });

  it('getEmployeesBySearch(): should be able to get employees by search without OR param', (done) => {
    const params = {
      order: 'full_name.asc,email.asc,id',
      email: 'in.(ajain@fyle.in)',
      and: '(or(is_enabled.eq.true),or(is_enabled.eq.true))',
    };
    spenderService.get.and.returnValue(of(employeesParamsRes));

    service.getEmployeesBySearch(params).subscribe((res) => {
      expect(res).toEqual(employeesParamsRes.data);
      expect(spenderService.get).toHaveBeenCalledWith('/employees', { params });
      done();
    });
  });
});
