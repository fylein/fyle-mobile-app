import { TestBed } from '@angular/core/testing';
import { PopoverController } from '@ionic/angular';
import { FyPopupComponent } from 'src/app/shared/components/fy-popup/fy-popup.component';
import { PopupService } from './popup.service';

describe('PopupService', () => {
  let popupService: PopupService;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['create', 'present']);
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
    const popoverSpy = jasmine.createSpyObj('popup', ['onWillDismiss', 'present']) as any;
    popoverController.create.and.returnValue(
      new Promise((resolve) => {
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

    expect(popoverController.create).toHaveBeenCalledWith({
      componentProps: {
        config: {
          header: 'Delete Expense',
          message: 'Are you sure you want to delete this expense?',
          primaryCta: {
            text: 'Delete',
          },
        },
      },
      component: FyPopupComponent,
      cssClass: 'dialog-popover',
    });
    expect(popoverSpy.present).toHaveBeenCalledTimes(1);

    expect(result).toEqual('primary');
  });
});
