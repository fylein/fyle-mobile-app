import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';

import { DismissDialogComponent } from './dismiss-dialog.component';
import { FormButtonValidationDirective } from 'src/app/shared/directive/form-button-validation.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { TranslocoService } from '@jsverse/transloco';

describe('DismissDialogComponent', () => {
  let component: DismissDialogComponent;
  let fixture: ComponentFixture<DismissDialogComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const dismissMethod = () => of(true);
  const errMethod = () => throwError(() => new Error('error'));

  beforeEach(waitForAsync(() => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    translocoService = jasmine.createSpyObj('TranslocoService', ['translate']);
    TestBed.configureTestingModule({
      declarations: [DismissDialogComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconTestingModule, MatIconModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DismissDialogComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display header and CTA text correctly', () => {
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.dismiss-dialog--header'))).toEqual(
      'Dismiss duplicate expenses'
    );
    expect(getTextContent(getElementBySelector(fixture, '.dismiss-dialog--dismiss'))).toEqual('Yes, dismiss');
  });

  it('cancel(): should cancel the CTA', () => {
    popoverController.dismiss.and.callThrough();
    component.dismissCallInProgress = false;
    fixture.detectChanges();

    component.cancel();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  describe('dismiss():', () => {
    it('should dismiss expense', (done) => {
      popoverController.dismiss.and.callThrough();
      component.dismissCallInProgress = false;
      component.dismissMethod = dismissMethod;
      fixture.detectChanges();

      component.dismiss();
      expect(popoverController.dismiss).toHaveBeenCalledWith({ status: 'success' });
      done();
    });

    it('should not dismiss expenses if dismiss method throws error', (done) => {
      popoverController.dismiss.and.callThrough();
      component.dismissCallInProgress = false;
      component.dismissMethod = errMethod;
      fixture.detectChanges();

      component.dismiss();
      expect(popoverController.dismiss).toHaveBeenCalledWith({ status: 'error' });
      done();
    });
  });

  it('should call cancel() if button is clicked', () => {
    const cancelFn = spyOn(component, 'cancel');

    const cancelButton = getElementBySelector(fixture, '.dismiss-dialog--cancel') as HTMLElement;
    click(cancelButton);
    expect(cancelFn).toHaveBeenCalledTimes(1);
  });

  it('should call dismiss() if card is clicked', () => {
    const dismissFn = spyOn(component, 'dismiss');

    const dismissCard = getElementBySelector(fixture, '.dismiss-dialog--dismiss') as HTMLElement;
    click(dismissCard);
    expect(dismissFn).toHaveBeenCalledTimes(1);
  });
});
