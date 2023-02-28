import { TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular';
import { PopupService } from './popup.service';

describe('PopupService', () => {
  let popupService: PopupService;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create']);
    TestBed.configureTestingModule({
      providers: [
        PopupService,
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
      ],
    });
    popupService = TestBed.inject(PopupService);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
  });

  it('should be created', () => {
    expect(popupService).toBeTruthy();
  });

  it('showPopup(): should show popup to the user', async () => {
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
        const popoverSpy = jasmine.createSpyObj('popup', ['onWillDismiss', 'present']) as any;
        popoverSpy.onWillDismiss.and.returnValue(
          new Promise((resInt) => {
            const data = {
              action: 'primary',
            };
            resInt({
              data,
            });
          })
        );
        resolve(popoverSpy);
      })
    );

    const result = await popupService.showPopup({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      primaryCta: {
        text: 'Delete',
      },
    });

    expect(result).toEqual('primary');
  });
});
