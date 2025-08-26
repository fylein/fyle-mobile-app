import { TestBed } from '@angular/core/testing';
import { SpenderFileService } from './file.service';
import { SpenderPlatformV1ApiService } from '../../../spender-platform-v1-api.service';
import { of, throwError } from 'rxjs';
import { generateUrlsBulkData1 } from 'src/app/core/mock-data/generate-urls-bulk-response.data';
import { 
  platformFileData, 
  platformFileBulkData, 
  platformFilePostRequestPayload, 
  platformFilePostRequestBulkPayload 
} from 'src/app/core/mock-data/platform-file.data';

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

  describe('createFile', () => {
    it('should create a single file successfully', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: platformFileData }));

      service.createFile(platformFilePostRequestPayload).subscribe((response) => {
        expect(response).toEqual(platformFileData);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files', { data: platformFilePostRequestPayload });
        done();
      });
    });

    it('should handle error when creating file fails', (done) => {
      const error = { status: 400, message: 'Bad Request' };
      spenderPlatformV1ApiService.post.and.returnValue(throwError(() => error));

      service.createFile(platformFilePostRequestPayload).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });
  });

  describe('createFilesBulk', () => {
    it('should create multiple files in bulk successfully', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: platformFileBulkData }));

      service.createFilesBulk(platformFilePostRequestBulkPayload).subscribe((response) => {
        expect(response).toEqual(platformFileBulkData);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files/bulk', { data: platformFilePostRequestBulkPayload });
        done();
      });
    });

    it('should handle error when bulk file creation fails', (done) => {
      const error = { status: 500, message: 'Internal Server Error' };
      spenderPlatformV1ApiService.post.and.returnValue(throwError(() => error));

      service.createFilesBulk(platformFilePostRequestBulkPayload).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should handle empty array input', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({ data: [] }));

      service.createFilesBulk([]).subscribe((response) => {
        expect(response).toEqual([]);
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files/bulk', { data: [] });
        done();
      });
    });
  });

  describe('deleteFilesBulk', () => {
    it('should delete multiple files in bulk successfully', (done) => {
      const fileIds = ['fi1', 'fi2', 'fi3'];
      const expectedPayload = { data: [{ id: 'fi1' }, { id: 'fi2' }, { id: 'fi3' }] };
      
      spenderPlatformV1ApiService.post.and.returnValue(of({}));

      service.deleteFilesBulk(fileIds).subscribe((response) => {
        expect(response).toEqual({});
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files/delete/bulk', expectedPayload);
        done();
      });
    });

    it('should handle error when bulk file deletion fails', (done) => {
      const fileIds = ['fi1', 'fi2'];
      const error = { status: 404, message: 'Files not found' };
      spenderPlatformV1ApiService.post.and.returnValue(throwError(() => error));

      service.deleteFilesBulk(fileIds).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should handle single file deletion', (done) => {
      const fileIds = ['fi1'];
      const expectedPayload = { data: [{ id: 'fi1' }] };
      
      spenderPlatformV1ApiService.post.and.returnValue(of({}));

      service.deleteFilesBulk(fileIds).subscribe((response) => {
        expect(response).toEqual({});
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files/delete/bulk', expectedPayload);
        done();
      });
    });

    it('should handle empty array input for deletion', (done) => {
      spenderPlatformV1ApiService.post.and.returnValue(of({}));

      service.deleteFilesBulk([]).subscribe((response) => {
        expect(response).toEqual({});
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/files/delete/bulk', { data: [] });
        done();
      });
    });
  });

  describe('attachToAdvance', () => {
    it('should attach files to advance request successfully', (done) => {
      const advanceRequestId = 'adv_123';
      const fileIds = ['fi1', 'fi2'];
      const expectedPayload = {
        data: [
          {
            id: advanceRequestId,
            file_ids: fileIds,
          },
        ],
      };

      spenderPlatformV1ApiService.post.and.returnValue(of(undefined));

      service.attachToAdvance(advanceRequestId, fileIds).subscribe((response) => {
        expect(response).toBeUndefined();
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/advance_requests/attach_files/bulk', expectedPayload);
        done();
      });
    });

    it('should handle error when attaching files to advance request fails', (done) => {
      const advanceRequestId = 'adv_123';
      const fileIds = ['fi1'];
      const error = { status: 403, message: 'Access denied' };
      spenderPlatformV1ApiService.post.and.returnValue(throwError(() => error));

      service.attachToAdvance(advanceRequestId, fileIds).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          done();
        }
      });
    });

    it('should handle single file attachment', (done) => {
      const advanceRequestId = 'adv_123';
      const fileIds = ['fi1'];
      const expectedPayload = {
        data: [
          {
            id: advanceRequestId,
            file_ids: fileIds,
          },
        ],
      };

      spenderPlatformV1ApiService.post.and.returnValue(of(undefined));

      service.attachToAdvance(advanceRequestId, fileIds).subscribe((response) => {
        expect(response).toBeUndefined();
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/advance_requests/attach_files/bulk', expectedPayload);
        done();
      });
    });

    it('should handle empty fileIds array', (done) => {
      const advanceRequestId = 'adv_123';
      const fileIds: string[] = [];
      const expectedPayload = {
        data: [
          {
            id: advanceRequestId,
            file_ids: fileIds,
          },
        ],
      };

      spenderPlatformV1ApiService.post.and.returnValue(of(undefined));

      service.attachToAdvance(advanceRequestId, fileIds).subscribe((response) => {
        expect(response).toBeUndefined();
        expect(spenderPlatformV1ApiService.post).toHaveBeenCalledWith('/advance_requests/attach_files/bulk', expectedPayload);
        done();
      });
    });
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
