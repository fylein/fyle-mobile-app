import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { fileObjectAdv, fileObjectAdv1, fileObjectData, fileObjectData4 } from '../mock-data/file-object.data';
import { ApiService } from './api.service';
import { DateService } from './date.service';

import { FileService } from './file.service';

describe('FileService', () => {
  let fileService: FileService;
  let apiService: jasmine.SpyObj<ApiService>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(() => {
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
    fileService = TestBed.inject(FileService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(fileService).toBeTruthy();
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

  it('findByAdvanceRequestId(): should return files for the given advance request ID', (done) => {
    const advanceRequestId = 'areqspMJTHN4Yk';

    apiService.get.and.returnValue(of(fileObjectAdv));
    spyOn(fileService, 'setFileType').and.returnValue(fileObjectAdv[0]);
    dateService.fixDates.and.returnValue(fileObjectAdv[0]);

    fileService.findByAdvanceRequestId(advanceRequestId).subscribe((res) => {
      expect(res).toEqual(fileObjectAdv);
      expect(apiService.get).toHaveBeenCalledOnceWith('/files', {
        params: {
          advance_request_id: advanceRequestId,
          skip_html: 'true',
        },
      });
      expect(fileService.setFileType).toHaveBeenCalledOnceWith(fileObjectAdv[0]);
      expect(dateService.fixDates).toHaveBeenCalledOnceWith(fileObjectAdv[0]);
      done();
    });
  });

  describe('setFileType():', () => {
    it('should set the file type', () => {
      spyOn(fileService, 'getFileExtension').and.returnValue('jpeg');
      const file = fileObjectAdv[0];
      const fileWithFileType = fileService.setFileType(file);
      expect(fileWithFileType.file_type).toEqual('image');
      expect(fileService.getFileExtension).toHaveBeenCalledOnceWith(file.name);
    });

    it('should set the file pdf type', () => {
      spyOn(fileService, 'getFileExtension').and.returnValue('pdf');
      const file = fileObjectAdv1;
      const fileWithFileType = fileService.setFileType(file);
      expect(fileWithFileType.file_type).toEqual('pdf');
      expect(fileService.getFileExtension).toHaveBeenCalledOnceWith(file.name);
    });
  });

  describe('getFileExtension():', () => {
    it('should return the file extension', () => {
      const file = fileObjectAdv[0];
      const fileExtension = fileService.getFileExtension(file.name);
      expect(fileExtension).toEqual('jpeg');
    });

    it('should return the file extension when file name is undefined', () => {
      const file = { ...fileObjectAdv1, name: undefined };
      const fileExtension = fileService.getFileExtension(file.name);
      expect(fileExtension).toBeNull();
    });
  });

  describe('getReceiptExtension():', () => {
    it('should return the extension when a valid URL is provided', () => {
      const url =
        'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee';

      expect(fileService.getReceiptExtension(url)).toEqual('jpeg');
    });

    it('should return the extension when a valid pdf URL is provided', () => {
      const url =
        'https://fyle-storage-mumbai-3.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=AKIA54Z3LIXTX6CFH4VG%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee';

      expect(fileService.getReceiptExtension(url)).toEqual('pdf');
    });

    it('should return null when an invalid URL is provided', () => {
      const url = 'https://fyle-storage-mumbai';

      expect(fileService.getReceiptExtension(url)).toBeNull();
    });

    it('should return null when an empty string is provided', () => {
      const url = '';

      expect(fileService.getReceiptExtension(url)).toBeNull();
    });
  });

  it('uploadUrl(): should upload the file url', (done) => {
    apiService.post.and.returnValue(of({ url: fileObjectAdv[0].url }));

    const fileId = 'fiHv71XQgoZp';
    fileService.uploadUrl(fileId).subscribe((res) => {
      expect(res).toEqual(fileObjectAdv[0].url);
      expect(apiService.post).toHaveBeenCalledOnceWith('/files/' + fileId + '/upload_url');
      done();
    });
  });

  describe('getReceiptsDetails():', () => {
    it('should return the receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('jpeg');
      expect(fileService.getReceiptsDetails(fileObjectAdv[0])).toEqual({
        thumbnail: fileObjectAdv[0].thumbnail,
        type: fileObjectAdv[0].type,
      });
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv[0].name);
    });

    it('should return the pdf receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('pdf');
      expect(fileService.getReceiptsDetails(fileObjectAdv1)).toEqual({
        thumbnail: 'img/fy-pdf.svg',
        type: fileObjectAdv1.type,
      });
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv1.name);
    });
  });

  describe('getAttachmentType():', () => {
    it('should return the attachment type', () => {
      expect(fileService.getAttachmentType(fileObjectAdv[0].type)).toEqual('image');
    });

    it('should return the pdf attachment type', () => {
      expect(fileService.getAttachmentType(fileObjectAdv1.type)).toEqual('pdf');
    });
  });

  it('post(): should post the file', (done) => {
    const payload = { name: fileObjectData4.name };
    apiService.post.and.returnValue(of(fileObjectData4));
    fileService.post(payload).subscribe((res) => {
      expect(res).toEqual(fileObjectData4);
      expect(apiService.post).toHaveBeenCalledOnceWith('/files', { name: fileObjectData4.name });
      done();
    });
  });

  describe('getReceiptDetails():', () => {
    it('should return the receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('jpeg');
      expect(fileService.getReceiptDetails(fileObjectAdv[0].url)).toEqual(fileObjectAdv[0].type);
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv[0].url);
    });

    it('should return the pdf receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('pdf');
      expect(fileService.getReceiptDetails(fileObjectAdv1.url)).toEqual(fileObjectAdv1.type);
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv1.url);
    });

    it('should return empty string if the there is no receipt type set', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('test');
      expect(fileService.getReceiptDetails('')).toEqual('');
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith('');
    });
  });

  it('getDataUrlFromBlob(): should convert a Blob to a data URL', async () => {
    const blob = new Blob(['Never Lose Track'], { type: 'text/plain' });
    const result = await fileService.getDataUrlFromBlob(blob);
    expect(result).toContain('data:text/plain;base64,TmV2ZXIgTG9zZSBUcmFjaw==');
  });

  it('getBlobFromDataUrl():', async () => {
    const base64 = 'data:image/heic;base64,R0lGODdhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    const arrayBuffer = Uint8Array.from(atob(base64.split(',')[1]), (c) => c.charCodeAt(0)).buffer;
    const blob = new Blob([arrayBuffer], { type: 'image/heic' });

    const result = fileService.getBlobFromDataUrl(base64);
    expect(result).toEqual(blob);
  });
});
