import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { ProjectsService } from './projects.service';
import { RecentlyUsedItemsService } from './recently-used-items.service';
import { recentlyUsedRes } from '../mock-data/recently-used.data';
import { of } from 'rxjs';

describe('RecentlyUsedItemsService', () => {
  let recentlyUsedItemsService: RecentlyUsedItemsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let projectService: jasmine.SpyObj<ProjectsService>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecentlyUsedItemsService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', ['get']),
        },
        {
          provide: ProjectsService,
          useValue: jasmine.createSpyObj('ProjectsService', ['getByParamsUnformatted']),
        },
      ],
    });
    recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    projectService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
  });

  it('should be created', () => {
    expect(recentlyUsedItemsService).toBeTruthy();
  });

  it('getRecentlyUsed(): should get recently used items', (done) => {
    apiService.get.and.returnValue(of(recentlyUsedRes));
    recentlyUsedItemsService.getRecentlyUsed().subscribe((res) => {
      expect(res).toEqual(recentlyUsedRes);
      expect(apiService.get).toHaveBeenCalledWith('/recently_used');
      done();
    });
  });
});
