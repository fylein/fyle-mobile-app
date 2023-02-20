import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;
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
    service = TestBed.inject(LoaderService);
    loadingController = TestBed.inject(LoadingController) as jasmine.SpyObj<LoadingController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('showLoader()', () => {
    it('showLoader(): should show loader with args', fakeAsync(() => {
      const message = 'Please wait...';
      const duration = 1000;
      const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present']);
      loadingController.create.and.returnValue(Promise.resolve(loadingElementSpy));

      service.showLoader(message, duration);
      tick();
      expect(loadingController.create).toHaveBeenCalledWith({
        message,
        duration,
      });
      expect(loadingElementSpy.present).toHaveBeenCalled();
    }));

    it('showLoader(): should show loader without args', fakeAsync(() => {
      const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['present']);
      loadingController.create.and.returnValue(Promise.resolve(loadingElementSpy));

      service.showLoader();
      tick();
      expect(loadingController.create).toHaveBeenCalled();
      expect(loadingElementSpy.present).toHaveBeenCalled();
    }));
  });

  it('hideLoader(): should hide loader', fakeAsync(() => {
    const loadingElementSpy = jasmine.createSpyObj('HTMLIonLoadingElement', ['dismiss']);
    loadingController.dismiss.and.returnValue(Promise.resolve(true));
    loadingController.create.and.returnValue(Promise.resolve(loadingElementSpy));

    service.hideLoader();
    tick();
    expect(loadingController.dismiss).toHaveBeenCalled();
  }));
});
