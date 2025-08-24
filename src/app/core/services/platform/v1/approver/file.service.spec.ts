import { TestBed } from '@angular/core/testing';
import { ApproverFileService } from './file.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { generateUrlsBulkData1 } from 'src/app/core/mock-data/generate-urls-bulk-response.data';
import { of } from 'rxjs';

describe('ApproverFileService', () => {
  let service: ApproverFileService;
  let approverPlatformApiService: jasmine.SpyObj<ApproverPlatformApiService>;

  beforeEach(() => {
    const approverPlatformApiServiceSpy = jasmine.createSpyObj('ApproverPlatformApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ApproverPlatformApiService,
          useValue: approverPlatformApiServiceSpy,
        },
      ],
    });
    service = TestBed.inject(ApproverFileService);
    approverPlatformApiService = TestBed.inject(
      ApproverPlatformApiService,
    ) as jasmine.SpyObj<ApproverPlatformApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('generateUrls(): should generate upload and download urls for the given file', (done) => {
    approverPlatformApiService.post.and.returnValue(of({ data: generateUrlsBulkData1[0] }));

    service.generateUrls('fi').subscribe((response) => {
      expect(response).toEqual(generateUrlsBulkData1[0]);
      done();
    });
  });

  it('generateUrlsBulk(): should generate upload and download urls for multiple files', (done) => {
    approverPlatformApiService.post.and.returnValue(of({ data: generateUrlsBulkData1 }));

    service.generateUrlsBulk(['fi']).subscribe((response) => {
      expect(response).toEqual(generateUrlsBulkData1);
      done();
    });
  });

  it('downloadFile(): should download file', (done) => {
    approverPlatformApiService.get.and.returnValue(of(undefined));

    service.downloadFile('fi').subscribe((response) => {
      expect(response).toBeUndefined();
      done();
    });
  });
});
