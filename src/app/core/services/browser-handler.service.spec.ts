import { TestBed } from '@angular/core/testing';
import { BrowserHandlerService } from './browser-handler.service';

describe('BrowserHandlerService', () => {
  let service: BrowserHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openLinkWithToolbarColor():', () => {
    it('should be defined', () => {
      expect(service.openLinkWithToolbarColor).toBeDefined();
    });
  });

  describe('openLinkWithWindowName():', () => {
    it('should be defined', () => {
      expect(service.openLinkWithWindowName).toBeDefined();
    });
  });
});
