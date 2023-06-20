import { of } from 'rxjs';
import { thumbnailUrlMockData, fileObjectData } from '../mock-data/file-object.data';
import { ApiService } from './api.service';
import { FileService } from './file.service';

export function TestCases1(getTestBed) {
  return fdescribe('test case set 2', () => {
    let fileService: FileService;
    let apiService: jasmine.SpyObj<ApiService>;

    beforeEach(() => {
      const TestBed = getTestBed();
      fileService = TestBed.inject(FileService);
      apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    });

    it('should be created', () => {
      expect(fileService).toBeTruthy();
    });

    it('downloadThumbnailUrl(): should return the file obj with thumbnail url', (done) => {
      apiService.post.and.returnValue(of(thumbnailUrlMockData));

      const fileId = 'fiwJ0nQTBpYH';
      fileService.downloadThumbnailUrl(fileId).subscribe((res) => {
        expect(res).toEqual(thumbnailUrlMockData);
        expect(apiService.post).toHaveBeenCalledOnceWith('/files/download_urls', [
          {
            id: fileId,
            purpose: 'THUMBNAILx200x200',
          },
        ]);
        done();
      });
    });

    it('getFilesWithThumbnail(): should return files with thumbnail for the given txn ID', (done) => {
      apiService.get.and.returnValue(of([fileObjectData]));

      const txnId = 'txdzGV1TZEg3';
      fileService.getFilesWithThumbnail(txnId).subscribe((res) => {
        expect(res).toEqual([fileObjectData]);
        expect(apiService.get).toHaveBeenCalledOnceWith('/files', {
          params: {
            transaction_id: txnId,
            skip_html: 'true',
            purpose: 'THUMBNAILx200x200',
          },
        });
        done();
      });
    });

    it('base64Download(): should return the base64 encoded file content', (done) => {
      apiService.get.and.returnValue(of({ content: 'base64encodedcontent' }));

      const fileId = 'fiAfXtUj24rJ';
      fileService.base64Download(fileId).subscribe((res) => {
        expect(res).toEqual({ content: 'base64encodedcontent' });
        expect(apiService.get).toHaveBeenCalledOnceWith('/files/' + fileId + '/download_b64');
        done();
      });
    });

    it('delete(): should delete the file', (done) => {
      apiService.delete.and.returnValue(of({}));

      const fileId = 'fiAfXtUj24rJ';
      fileService.delete(fileId).subscribe((res) => {
        expect(res).toEqual({});
        expect(apiService.delete).toHaveBeenCalledOnceWith('/files/' + fileId);
        done();
      });
    });

    it('getImageTypeFromDataUrl(): should return image type from data URL', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
      const imageType = fileService.getImageTypeFromDataUrl(dataUrl);
      expect(imageType).toEqual('image/png');
    });

    it('findByTransactionId(): should return files for the given txn ID', (done) => {
      apiService.get.and.returnValue(of([fileObjectData]));

      const txnId = 'txdzGV1TZEg3';
      fileService.findByTransactionId(txnId).subscribe((res) => {
        expect(res).toEqual([fileObjectData]);
        expect(apiService.get).toHaveBeenCalledOnceWith('/files', {
          params: {
            transaction_id: txnId,
            skip_html: 'true',
          },
        });
        done();
      });
    });

    it('downloadUrl(): should return the file download url', (done) => {
      const fileId = 'fiAfXtUj24rJ';
      const mockDownloadUrl = {
        url: 'mock-url',
      };
      apiService.post.and.returnValue(of(mockDownloadUrl));

      fileService.downloadUrl(fileId).subscribe((res) => {
        expect(res).toEqual(mockDownloadUrl.url);
        expect(apiService.post).toHaveBeenCalledOnceWith('/files/' + fileId + '/download_url');
        done();
      });
    });
  });
}
