import { TestBed } from '@angular/core/testing';
import { ApproverFileService } from './file.service';
import { ApproverPlatformApiService } from '../../../approver-platform-api.service';
import { generateUrlsBulkData1 } from 'src/app/core/mock-data/generate-urls-bulk-response.data';
import {
  platformFileData,
  platformFileBulkData,
  platformFilePostRequestPayload,
  platformFilePostRequestBulkPayload,
} from 'src/app/core/mock-data/platform-file.data';
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

  it('createFile(): should create a single file', (done) => {
    approverPlatformApiService.post.and.returnValue(of({ data: platformFileData }));

    service.createFile(platformFilePostRequestPayload).subscribe((response) => {
      expect(response).toEqual(platformFileData);
      expect(approverPlatformApiService.post).toHaveBeenCalledWith('/files', platformFilePostRequestPayload);
      done();
    });
  });

  it('createFilesBulk(): should create multiple files in bulk', (done) => {
    approverPlatformApiService.post.and.returnValue(of({ data: platformFileBulkData }));

    service.createFilesBulk(platformFilePostRequestBulkPayload).subscribe((response) => {
      expect(response).toEqual(platformFileBulkData);
      expect(approverPlatformApiService.post).toHaveBeenCalledWith('/files/bulk', {
        data: platformFilePostRequestBulkPayload,
      });
      done();
    });
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

  it('deleteFilesBulk(): should delete multiple files in bulk', (done) => {
    const fileIds = ['fi1', 'fi2'];
    approverPlatformApiService.post.and.returnValue(of(undefined));

    service.deleteFilesBulk(fileIds).subscribe((response) => {
      expect(response).toBeUndefined();
      expect(approverPlatformApiService.post).toHaveBeenCalledWith('/files/delete/bulk', {
        data: [{ id: 'fi1' }, { id: 'fi2' }],
      });
      done();
    });
  });

  it('attachToAdvance(): should attach files to an advance request', (done) => {
    const advanceRequestId = 'adv123';
    const fileIds = ['fi1', 'fi2'];
    const userId = 'user123';
    approverPlatformApiService.post.and.returnValue(of(undefined));

    service.attachToAdvance(advanceRequestId, fileIds, userId).subscribe((response) => {
      expect(response).toBeUndefined();
      expect(approverPlatformApiService.post).toHaveBeenCalledWith('/advance_requests/attach_files/bulk', {
        data: [
          {
            id: advanceRequestId,
            file_ids: fileIds,
            user_id: userId,
          },
        ],
      });
      done();
    });
  });
});
