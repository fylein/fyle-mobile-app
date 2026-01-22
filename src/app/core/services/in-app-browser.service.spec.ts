import { TestBed } from '@angular/core/testing';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { InAppBrowserService } from './in-app-browser.service';

describe('InAppBrowserService', () => {
  let service: InAppBrowserService;
  let inAppBrowserSpy: jasmine.SpyObj<InAppBrowser>;

  beforeEach(() => {
    inAppBrowserSpy = jasmine.createSpyObj('InAppBrowser', ['create']);

    TestBed.configureTestingModule({
      providers: [{ provide: InAppBrowser, useValue: inAppBrowserSpy }],
    });
    service = TestBed.inject(InAppBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create():', () => {
    it('should call inAppBrowser.create with url only', () => {
      const url = 'https://example.com';
      const mockBrowserRef = {} as any;
      inAppBrowserSpy.create.and.returnValue(mockBrowserRef);

      const result = service.create(url);

      expect(inAppBrowserSpy.create).toHaveBeenCalledOnceWith(url, undefined, undefined);
      expect(result).toBe(mockBrowserRef);
    });

    it('should call inAppBrowser.create with url and target', () => {
      const url = 'https://example.com';
      const target = '_blank';
      const mockBrowserRef = {} as any;
      inAppBrowserSpy.create.and.returnValue(mockBrowserRef);

      const result = service.create(url, target);

      expect(inAppBrowserSpy.create).toHaveBeenCalledOnceWith(url, target, undefined);
      expect(result).toBe(mockBrowserRef);
    });

    it('should call inAppBrowser.create with all options', () => {
      const url = 'https://example.com';
      const target = '_system';
      const options = { location: 'yes' as const, toolbar: 'yes' as const };
      const mockBrowserRef = {} as any;
      inAppBrowserSpy.create.and.returnValue(mockBrowserRef);

      const result = service.create(url, target, options);

      expect(inAppBrowserSpy.create).toHaveBeenCalledOnceWith(url, target, options);
      expect(result).toBe(mockBrowserRef);
    });
  });
});
