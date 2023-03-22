import { TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular';

import { BackButtonService } from './back-button.service';

describe('BackButtonService', () => {
  let backButtonService: BackButtonService;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    TestBed.configureTestingModule({
      providers: [BackButtonService, { provide: PopoverController, useValue: popoverControllerSpy }],
    });
    backButtonService = TestBed.inject(BackButtonService);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
  });

  it('should be created', () => {
    expect(backButtonService).toBeTruthy();
  });
});
