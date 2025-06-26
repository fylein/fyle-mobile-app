import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { LoaderService } from './loader.service';
import { TranslocoService } from '@jsverse/transloco';
describe('LoaderService', () => {
  let loaderService: LoaderService;
  let loadingController: jasmine.SpyObj<LoadingController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(() => {
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create', 'dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string) => {
      const translations: { [key: string]: string } = {
        'services.loader.pleaseWait': 'Please wait...',
      };
      return translations[key] || key;
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoadingController,
          useValue: loadingControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    loaderService = TestBed.inject(LoaderService);
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(loaderService).toBeTruthy();
  });

  describe('showLoader()', () => {
    it('showLoader(): should show loader with args', fakeAsync(() => {
      const message = 'Please wait...';
      const duration = 1000;
      const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present']);
      loadingController.create.and.resolveTo(loadingElementSpy);

      loaderService.showLoader(message, duration);
      tick();
      expect(loadingController.create).toHaveBeenCalledOnceWith({
        message,
        duration,
        spinner: 'crescent',
        cssClass: 'intermediate-loader',
      });
      expect(loadingElementSpy.present).toHaveBeenCalledTimes(1);
    }));

    it('showLoader(): should show loader without args', fakeAsync(() => {
      const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present']);
      loadingController.create.and.resolveTo(loadingElementSpy);

      loaderService.showLoader();
      tick();
      expect(loadingController.create).toHaveBeenCalledTimes(1);
      expect(loadingElementSpy.present).toHaveBeenCalledTimes(1);
    }));
  });

  it('hideLoader(): should hide loader', fakeAsync(() => {
    const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['dismiss']);
    loadingController.dismiss.and.resolveTo(loadingElementSpy);

    loaderService.hideLoader();
    tick();
    expect(loadingController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('hideLoader(): should catch errors in hide loader', fakeAsync(() => {
    const error = 'Something went wrong';
    loadingController.dismiss.and.rejectWith(error);

    loaderService.hideLoader();
    tick();
    expect(loadingController.dismiss).toHaveBeenCalledTimes(1);
  }));
});
