import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { RouterApiService } from './router-api.service';
import { of } from 'rxjs';

describe('RouterApiService', () => {
  let routerApiService: RouterApiService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        RouterApiService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });

    routerApiService = TestBed.inject(RouterApiService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(routerApiService).toBeTruthy();
  });
});
