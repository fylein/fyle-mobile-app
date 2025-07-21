import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Translation } from '@jsverse/transloco';

import { TranslocoHttpLoader } from './transloco-http-loader';

describe('TranslocoHttpLoader', () => {
  let service: TranslocoHttpLoader;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslocoHttpLoader],
    });

    service = TestBed.inject(TranslocoHttpLoader);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTranslation', () => {
    it('should make HTTP GET request to correct URL for English', () => {
      const lang = 'en';
      const mockTranslation: Translation = {
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
      };

      service.getTranslation(lang).subscribe((translation) => {
        expect(translation).toEqual(mockTranslation);
      });

      const req = httpTestingController.expectOne(`./assets/i18n/${lang}.json`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslation);
    });

    it('should make HTTP GET request to correct URL for different language', () => {
      const lang = 'es';
      const mockTranslation: Translation = {
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        'common.delete': 'Eliminar',
      };

      service.getTranslation(lang).subscribe((translation) => {
        expect(translation).toEqual(mockTranslation);
      });

      const req = httpTestingController.expectOne(`./assets/i18n/${lang}.json`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslation);
    });

    it('should handle empty translation object', () => {
      const lang = 'fr';
      const mockTranslation: Translation = {};

      service.getTranslation(lang).subscribe((translation) => {
        expect(translation).toEqual(mockTranslation);
      });

      const req = httpTestingController.expectOne(`./assets/i18n/${lang}.json`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTranslation);
    });

    it('should return observable that handles HTTP errors', () => {
      const lang = 'invalid';
      const errorMessage = 'Translation file not found';

      service.getTranslation(lang).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpTestingController.expectOne(`./assets/i18n/${lang}.json`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });
});
