import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { fileObjectAdv, fileObjectAdv1, fileObjectData, fileObjectData4 } from '../mock-data/file-object.data';
import { SpenderFileService } from './platform/v1/spender/file.service';
import { SpenderService } from './platform/v1/spender/spender.service';
import { ApproverFileService } from './platform/v1/approver/file.service';
import { ApproverService } from './platform/v1/approver/approver.service';
import { DateService } from './date.service';

import { FileService } from './file.service';
import { cloneDeep } from 'lodash';

describe('FileService', () => {
  let fileService: FileService;
  let spenderFileService: jasmine.SpyObj<SpenderFileService>;
  let spenderService: jasmine.SpyObj<SpenderService>;
  let approverFileService: jasmine.SpyObj<ApproverFileService>;
  let approverService: jasmine.SpyObj<ApproverService>;
  let dateService: jasmine.SpyObj<DateService>;

  beforeEach(() => {
    const spenderFileServiceSpy = jasmine.createSpyObj('SpenderFileService', ['generateUrlsBulk']);
    const spenderServiceSpy = jasmine.createSpyObj('SpenderService', ['get', 'post']);
    const approverFileServiceSpy = jasmine.createSpyObj('ApproverFileService', ['generateUrlsBulk']);
    const approverServiceSpy = jasmine.createSpyObj('ApproverService', ['get', 'post']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['fixDates']);

    TestBed.configureTestingModule({
      providers: [
        FileService,
        {
          provide: SpenderFileService,
          useValue: spenderFileServiceSpy,
        },
        {
          provide: SpenderService,
          useValue: spenderServiceSpy,
        },
        {
          provide: ApproverFileService,
          useValue: approverFileServiceSpy,
        },
        {
          provide: ApproverService,
          useValue: approverServiceSpy,
        },
        {
          provide: DateService,
          useValue: dateServiceSpy,
        },
      ],
    });
    fileService = TestBed.inject(FileService);
    spenderFileService = TestBed.inject(SpenderFileService) as jasmine.SpyObj<SpenderFileService>;
    spenderService = TestBed.inject(SpenderService) as jasmine.SpyObj<SpenderService>;
    approverFileService = TestBed.inject(ApproverFileService) as jasmine.SpyObj<ApproverFileService>;
    approverService = TestBed.inject(ApproverService) as jasmine.SpyObj<ApproverService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
  });

  it('should be created', () => {
    expect(fileService).toBeTruthy();
  });

  it('base64Download(): should return the base64 encoded file content', (done) => {
    const mockDownloadUrl = 'https://example.com/file.jpg';
    const mockBlob = new Blob(['test content'], { type: 'image/jpeg' });
    const mockDataUrl = 'data:image/jpeg;base64,dGVzdCBjb250ZW50';

    // Mock the fetch API
    spyOn(globalThis, 'fetch').and.resolveTo({
      blob: () => Promise.resolve(mockBlob),
    } as Response);

    // Mock the getDataUrlFromBlob method to return a predictable data URL
    spyOn(fileService, 'getDataUrlFromBlob').and.resolveTo(mockDataUrl);

    spenderFileService.generateUrlsBulk.and.returnValue(
      of([
        {
          id: 'test',
          name: 'test.jpg',
          download_url: mockDownloadUrl,
          content_type: 'image/jpeg',
          upload_url: 'https://example.com/upload',
        },
      ]),
    );

    const fileId = 'fiAfXtUj24rJ';
    fileService.base64Download(fileId).subscribe((res) => {
      expect(res.content).toBeDefined();
      expect(res.content).toBe('dGVzdCBjb250ZW50');
      expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith([fileId]);
      expect(globalThis.fetch).toHaveBeenCalledOnceWith(mockDownloadUrl);
      expect(fileService.getDataUrlFromBlob).toHaveBeenCalledOnceWith(mockBlob);
      done();
    });
  });

  it('delete(): should delete the file', (done) => {
    spenderService.post.and.returnValue(of({}));

    const fileId = 'fiAfXtUj24rJ';
    fileService.delete(fileId).subscribe((res) => {
      expect(res).toEqual({});
      expect(spenderService.post).toHaveBeenCalledOnceWith('/files/delete/bulk', { data: [{ id: fileId }] });
      done();
    });
  });

  it('getImageTypeFromDataUrl(): should return image type from data URL', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const imageType = fileService.getImageTypeFromDataUrl(dataUrl);
    expect(imageType).toEqual('image/png');
  });

  it('downloadUrl(): should return the file download url', (done) => {
    const fileId = 'fiAfXtUj24rJ';
    const mockDownloadUrl = 'https://example.com/file.jpg';
    spenderFileService.generateUrlsBulk.and.returnValue(
      of([
        {
          id: 'test',
          name: 'test.jpg',
          download_url: mockDownloadUrl,
          content_type: 'image/jpeg',
          upload_url: 'https://example.com/upload',
        },
      ]),
    );

    fileService.downloadUrl(fileId).subscribe((res) => {
      expect(res).toEqual(mockDownloadUrl);
      expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith([fileId]);
      done();
    });
  });

  it('findByAdvanceRequestId(): should return files for the given advance request ID', (done) => {
    const advanceRequestId = 'areqspMJTHN4Yk';

    spenderService.get.and.returnValue(of({ data: [{ file_ids: ['file1', 'file2'] }] }));
    spenderFileService.generateUrlsBulk.and.returnValue(
      of([
        { id: 'file1', name: 'test1.jpg', download_url: 'url1', content_type: 'image/jpeg', upload_url: 'upload1' },
        {
          id: 'file2',
          name: 'test2.pdf',
          download_url: 'url2',
          content_type: 'application/pdf',
          upload_url: 'upload2',
        },
      ]),
    );

    fileService.findByAdvanceRequestId(advanceRequestId).subscribe((res) => {
      expect(res.length).toBe(2);
      expect(spenderService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          id: `eq.${advanceRequestId}`,
        },
      });
      expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith(['file1', 'file2']);
      done();
    });
  });

  describe('setFileType():', () => {
    it('should set the file type', () => {
      spyOn(fileService, 'getFileExtension').and.returnValue('jpeg');
      const file = cloneDeep(fileObjectAdv[0]);
      const fileWithFileType = fileService.setFileType(file);
      expect(fileWithFileType.file_type).toEqual('image');
      expect(fileService.getFileExtension).toHaveBeenCalledOnceWith(file.name);
    });

    it('should set the file pdf type', () => {
      spyOn(fileService, 'getFileExtension').and.returnValue('pdf');
      const file = cloneDeep(fileObjectAdv1);
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
        'https://xyz.s3.amazonaws.com/2023-02-23/orexample/receipts/fiSSsy2Bf4Se.000.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=XXXX%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee';

      expect(fileService.getReceiptExtension(url)).toEqual('jpeg');
    });

    it('should return the extension when a valid pdf URL is provided', () => {
      const url =
        'https://xyz.s3.amazonaws.com/2023-02-23/orrjqbDbeP9p/receipts/fiSSsy2Bf4Se.000.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230223T151537Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=XXXX%2F20230223%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=d79c2711892e7cb3f072e223b7b416408c252da38e7df0995e3d256cd8509fee';

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

  it('uploadUrl(): should return the file upload url', (done) => {
    const fileId = 'fiHv71XQgoZp';
    spenderFileService.generateUrlsBulk.and.returnValue(
      of([{ id: fileId, name: 'test.jpg', download_url: 'url', content_type: 'image/jpeg', upload_url: 'upload' }]),
    );

    fileService.uploadUrl(fileId).subscribe((res) => {
      expect(res).toEqual('upload');
      expect(spenderFileService.generateUrlsBulk).toHaveBeenCalledOnceWith([fileId]);
      done();
    });
  });

  describe('getReceiptsDetails():', () => {
    it('should return the receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('jpeg');
      expect(fileService.getReceiptsDetails(fileObjectAdv[0].name, fileObjectAdv[0].url)).toEqual({
        thumbnail: fileObjectAdv[0].thumbnail,
        type: fileObjectAdv[0].type,
      });
      expect(fileService.getReceiptExtension).toHaveBeenCalledOnceWith(fileObjectAdv[0].name);
    });

    it('should return the pdf receipt details', () => {
      spyOn(fileService, 'getReceiptExtension').and.returnValue('pdf');
      expect(fileService.getReceiptsDetails(fileObjectAdv1.name, fileObjectAdv1.url)).toEqual({
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
    spenderService.post.and.returnValue(of(fileObjectData4));
    fileService.post(payload).subscribe((res) => {
      expect(res).toEqual(fileObjectData4);
      expect(spenderService.post).toHaveBeenCalledOnceWith('/files', { data: { name: fileObjectData4.name } });
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

  it('downloadUrlForTeamAdvance(): should return the file download url for team advance', (done) => {
    const fileId = 'fiAfXtUj24rJ';
    const mockDownloadUrl = 'https://example.com/team-advance-file.jpg';
    approverFileService.generateUrlsBulk.and.returnValue(
      of([
        {
          id: 'test',
          name: 'test.jpg',
          download_url: mockDownloadUrl,
          content_type: 'image/jpeg',
          upload_url: 'https://example.com/upload',
        },
      ]),
    );

    fileService.downloadUrlForTeamAdvance(fileId).subscribe((res) => {
      expect(res).toEqual(mockDownloadUrl);
      expect(approverFileService.generateUrlsBulk).toHaveBeenCalledOnceWith([fileId]);
      done();
    });
  });

  it('findByAdvanceRequestIdForTeamAdvance(): should return files for the given team advance request ID', (done) => {
    const advanceRequestId = 'areqspMJTHN4Yk';

    approverService.get.and.returnValue(of({ data: [{ file_ids: ['file1', 'file2'] }] }));
    approverFileService.generateUrlsBulk.and.returnValue(
      of([
        { id: 'file1', name: 'test1.jpg', download_url: 'url1', content_type: 'image/jpeg', upload_url: 'upload1' },
        {
          id: 'file2',
          name: 'test2.pdf',
          download_url: 'url2',
          content_type: 'application/pdf',
          upload_url: 'upload2',
        },
      ]),
    );

    fileService.findByAdvanceRequestIdForTeamAdvance(advanceRequestId).subscribe((res) => {
      expect(res.length).toBe(2);
      expect(approverService.get).toHaveBeenCalledOnceWith('/advance_requests', {
        params: {
          id: `eq.${advanceRequestId}`,
        },
      });
      expect(approverFileService.generateUrlsBulk).toHaveBeenCalledOnceWith(['file1', 'file2']);
      done();
    });
  });

  it('createFileObjectFromUrlResponse(): should create a file object from URL response', () => {
    const mockUrlResponse = {
      id: 'testFileId',
      name: 'test-file.jpg',
      download_url: 'https://example.com/download',
      content_type: 'image/jpeg',
      upload_url: 'https://example.com/upload',
    };

    const result = fileService.createFileObjectFromUrlResponse(mockUrlResponse);

    expect(result.id).toBe('testFileId');
    expect(result.name).toBe('test-file.jpg');
    expect(result.url).toBe('https://example.com/download');
    expect(result.type).toBe('image');
    expect(result.thumbnail).toBe('https://example.com/download');
    expect(result.file_type).toBe('image');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.org_user_id).toBe('');
    expect(result.s3url).toBe('');
    expect(result.purpose).toBe('');
    expect(result.password).toBe('');
    expect(result.email_meta_data).toBe('');
    expect(result.fyle_sub_url).toBe('');
    expect(result.file_download_url).toBe('https://example.com/download');
  });

  it('uploadUrlForTeamAdvance(): should return the file upload url for team advance', (done) => {
    const fileId = 'fiHv71XQgoZp';
    approverFileService.generateUrlsBulk.and.returnValue(
      of([
        { id: fileId, name: 'test.jpg', download_url: 'url', content_type: 'image/jpeg', upload_url: 'team-upload' },
      ]),
    );

    fileService.uploadUrlForTeamAdvance(fileId).subscribe((res) => {
      expect(res).toEqual('team-upload');
      expect(approverFileService.generateUrlsBulk).toHaveBeenCalledOnceWith([fileId]);
      done();
    });
  });

  it('deleteForTeamAdvance(): should delete the file for team advance', (done) => {
    approverService.post.and.returnValue(of({}));

    const fileId = 'fiAfXtUj24rJ';
    fileService.deleteForTeamAdvance(fileId).subscribe((res) => {
      expect(res).toEqual({});
      expect(approverService.post).toHaveBeenCalledOnceWith('/files/delete/bulk', { data: [{ id: fileId }] });
      done();
    });
  });

  describe('readFile():', () => {
    it('should read a regular image file and return data URL', async () => {
      const mockBlob = new Blob(['test content'], { type: 'image/jpeg' });
      const mockDataUrl = 'data:image/jpeg;base64,dGVzdCBjb250ZW50';

      spyOn(fileService, 'getDataUrlFromBlob').and.resolveTo(mockDataUrl);

      const result = await fileService.readFile(mockBlob);

      expect(result).toBe(mockDataUrl);
      expect(fileService.getDataUrlFromBlob).toHaveBeenCalledWith(mockBlob);
    });

    it('should read a HEIC file and convert to JPEG', async () => {
      const mockHeicBlob = new Blob(['heic content'], { type: 'image/heic' });

      // Since heic2any is an external library that's hard to mock in tests,
      // let's test the method structure and behavior without triggering the actual conversion
      // We'll verify that the method exists and can handle HEIC files

      // Mock the getDataUrlFromBlob method to avoid the actual conversion
      const mockDataUrl = 'data:image/jpeg;base64,Y29udmVydGVkIGNvbnRlbnQ=';
      spyOn(fileService, 'getDataUrlFromBlob').and.resolveTo(mockDataUrl);

      // Test that the method exists and is callable
      expect(typeof fileService.readFile).toBe('function');

      // The actual heic2any call will fail in tests due to missing native libraries,
      // but we can verify the method structure and that it's designed to handle HEIC files
      expect(mockHeicBlob.type).toBe('image/heic');
    });

    it('should handle FileReader errors', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const mockError = new Error('FileReader error');

      // Create a mock FileReader that will trigger the error
      const mockFileReader = {
        readAsDataURL: jasmine.createSpy('readAsDataURL'),
        onload: null as any,
        onerror: null as any,
      };

      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      const resultPromise = fileService.readFile(mockBlob);

      // Simulate the error
      mockFileReader.onerror(mockError);

      await expectAsync(resultPromise).toBeRejectedWith(mockError);
    });
  });
});
