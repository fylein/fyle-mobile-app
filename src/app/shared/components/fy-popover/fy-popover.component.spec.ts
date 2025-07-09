import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getElementBySelector } from 'src/app/core/dom-helpers';
import { FyPopoverComponent } from './fy-popover.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('FyPopoverComponent', () => {
  let component: FyPopoverComponent;
  let fixture: ComponentFixture<FyPopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
  let simpleFormInput: DebugElement;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    await TestBed.configureTestingModule({
      declarations: [FyPopoverComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule, TranslocoModule],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FyPopoverComponent);
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    simpleFormInput = fixture.debugElement.nativeElement.querySelector('textarea');
    component = fixture.componentInstance;
    fixture.detectChanges();
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyPopover.done': 'Done',
        'fyPopover.placeholder': 'Type your reason here',
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dismiss(): should dismiss the popover', () => {
    popoverController.dismiss.and.resolveTo(true);
    component.dismiss();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('submit(): should submit the form', () => {
    popoverController.dismiss.and.resolveTo(true);
    component.formValue = 'Test comment';
    component.submit();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ comment: 'Test comment' });
  });

  it('should disable the submit button when form value is empty', () => {
    const submitButton = getElementBySelector(fixture, '.fy-popover--toolbar__btn') as HTMLButtonElement;
    component.formValue = '';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable the submit button when form value is not empty', () => {
    const submitButton = getElementBySelector(fixture, '.fy-popover--toolbar__btn') as HTMLButtonElement;
    component.formValue = 'Test comment';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeFalse();
  });
});
