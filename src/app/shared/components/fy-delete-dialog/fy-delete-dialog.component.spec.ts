import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FormButtonValidationDirective } from '../../directive/form-button-validation.directive';
import { FyDeleteDialogComponent } from './fy-delete-dialog.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';

describe('FyDeleteDialogComponent', () => {
  let component: FyDeleteDialogComponent;
  let fixture: ComponentFixture<FyDeleteDialogComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const deleteMethod = () => of(true);
  const errMethod = () => throwError(() => new Error('error'));

  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    TestBed.configureTestingModule({
      declarations: [FyDeleteDialogComponent, FormButtonValidationDirective],
      imports: [IonicModule.forRoot(), FormsModule, MatIconTestingModule, MatIconModule, TranslocoModule],
      providers: [
        {
          provide: PopoverController,
          useValue: popoverControllerSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FyDeleteDialogComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyDeleteDialog.cancel': 'Cancel',
        'fyDeleteDialog.delete': 'Delete',
        'fyDeleteDialog.deleting': 'Deleting',
      };
      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof translation === 'string') {
        Object.keys(params).forEach((paramKey) => {
          const placeholder = `{{${paramKey}}}`;
          translation = translation.replace(placeholder, params[paramKey]);
        });
      }

      return translation;
    });
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display header, info-message and CTA text correctly', () => {
    component.header = 'Header';
    component.infoMessage = 'Message';
    component.ctaText = 'Are you sure?';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.fy-delete-dialog--header'))).toEqual('Header');
    expect(getTextContent(getElementBySelector(fixture, '.fy-delete-dialog--info-container__message'))).toEqual(
      'Message'
    );
    expect(getTextContent(getElementBySelector(fixture, '.fy-delete-dialog--delete'))).toEqual('Are you sure?');
  });

  it('should show Delete if CTA text is missing', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(getTextContent(getElementBySelector(fixture, '.fy-delete-dialog--delete'))).toEqual('Delete');
  }));

  it('cancel(): should cancel the CTA', () => {
    popoverController.dismiss.and.callThrough();
    component.deleteCallInProgress = false;
    fixture.detectChanges();

    component.cancel();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  describe('delete():', () => {
    it(' should delete item', (done) => {
      popoverController.dismiss.and.callThrough();
      component.deleteCallInProgress = false;
      component.deleteMethod = deleteMethod;
      fixture.detectChanges();

      component.delete();
      expect(popoverController.dismiss).toHaveBeenCalledWith({ status: 'success' });
      done();
    });

    it('should delete item', (done) => {
      popoverController.dismiss.and.callThrough();
      component.deleteCallInProgress = false;
      component.deleteMethod = errMethod;
      fixture.detectChanges();

      component.delete();
      expect(popoverController.dismiss).toHaveBeenCalledWith({ status: 'error' });
      done();
    });
  });

  it('should call cancel() if button is clicked', () => {
    const cancelFn = spyOn(component, 'cancel');

    const cancelButton = getElementBySelector(fixture, '.fy-delete-dialog--cancel') as HTMLElement;
    click(cancelButton);
    expect(cancelFn).toHaveBeenCalledTimes(1);
  });

  it('should call delete() if card is clicked', () => {
    const deleteFn = spyOn(component, 'delete');

    const deleteCard = getElementBySelector(fixture, '.fy-delete-dialog--delete') as HTMLElement;
    click(deleteCard);
    expect(deleteFn).toHaveBeenCalledTimes(1);
  });
});
