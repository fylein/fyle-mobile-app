import { TestBed } from '@angular/core/testing';
import { SpenderFileService } from './file.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { of } from 'rxjs';
import { generateUrlsBulkData1 } from 'src/app/core/mock-data/generate-urls-bulk-response.data';

describe('SpenderFileService', () => {
  let service: SpenderFileService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
      ],
    });
    service = TestBed.inject(SpenderFileService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generateUrls(): should generate upload and download urls for the given file', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: generateUrlsBulkData1[0] }));

    service.generateUrls('fi').subscribe((response) => {
      expect(response).toEqual(generateUrlsBulkData1[0]);
      done();
    });
  });

  it('generateUrlsBulk(): should generate upload and download urls for multiple files', (done) => {
    spenderPlatformV1ApiService.post.and.returnValue(of({ data: generateUrlsBulkData1 }));

    service.generateUrlsBulk(['fi']).subscribe((response) => {
      expect(response).toEqual(generateUrlsBulkData1);
      done();
    });
  });

  it('downloadFile(): should download file', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of({}));

    service.downloadFile('fi').subscribe((response) => {
      expect(response).toEqual({});
      done();
    });
  });
});
