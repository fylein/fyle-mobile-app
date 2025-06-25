import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getElementBySelector, getElementByTagName } from 'src/app/core/dom-helpers';

import { EditReportNamePopoverComponent } from './edit-report-name-popover.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('EditReportNamePopoverComponent', () => {
  let component: EditReportNamePopoverComponent;
  let fixture: ComponentFixture<EditReportNamePopoverComponent>;
  let popoverController: jasmine.SpyObj<PopoverController>;
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
      declarations: [EditReportNamePopoverComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule, TranslocoModule],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReportNamePopoverComponent);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'editReportNamePopover.editName': 'Edit name',
        'editReportNamePopover.save': 'Save',
        'editReportNamePopover.reportName': 'Report name',
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
    component.reportName = 'Report 1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should have report name input', () => {
      fixture.detectChanges();
      const inputEl = getElementByTagName(fixture, 'input') as HTMLInputElement;
      expect(inputEl).toBeTruthy();
    });

    it('should have Save button disabled when report name is empty', () => {
      const saveButton = getElementBySelector(fixture, '.edit-report-name--toolbar__btn-save') as HTMLButtonElement;
      component.reportName = '';
      fixture.detectChanges();
      expect(saveButton.disabled).toBeTrue();
    });

    it('should have Save button enabled when report name is not empty', () => {
      const saveButton = getElementBySelector(fixture, '.edit-report-name--toolbar__btn-save') as HTMLButtonElement;
      fixture.detectChanges();
      expect(saveButton.disabled).toBeFalse();
    });
  });

  it('closePopover(): should call closePopover method when close button is clicked', () => {
    popoverController.dismiss.and.resolveTo(true);
    const closeButton = getElementBySelector(fixture, '.fy-icon-close') as HTMLButtonElement;
    closeButton.click();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('saveReportName(): should call saveReportName method when save button is clicked', () => {
    popoverController.dismiss.and.resolveTo(true);
    const saveButton = getElementBySelector(fixture, '.edit-report-name--toolbar__btn-save') as HTMLButtonElement;
    fixture.detectChanges();
    saveButton.click();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ reportName: 'Report 1' });
  });
});
