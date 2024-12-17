import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let loaderService: LoaderService;
  let loadingController: jasmine.SpyObj<LoadingController>;

  beforeEach(() => {
    const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create', 'dismiss']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoadingController,
          useValue: loadingControllerSpy,
        },
      ],
    });
    loaderService = TestBed.inject(LoaderService);
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
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
        cssClass: '',
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
