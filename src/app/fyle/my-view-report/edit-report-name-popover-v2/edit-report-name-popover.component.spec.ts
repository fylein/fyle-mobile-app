import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { getElementBySelector, getElementByTagName } from 'src/app/core/dom-helpers';

import { EditReportNamePopoverComponentV2 } from './edit-report-name-popover.component';

describe('EditReportNamePopoverComponentV2', () => {
  let component: EditReportNamePopoverComponentV2;
  let fixture: ComponentFixture<EditReportNamePopoverComponentV2>;
  let popoverController: jasmine.SpyObj<PopoverController>;

  beforeEach(async () => {
    const popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);
    await TestBed.configureTestingModule({
      declarations: [EditReportNamePopoverComponentV2],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [{ provide: PopoverController, useValue: popoverControllerSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditReportNamePopoverComponentV2);
    component = fixture.componentInstance;
    popoverController = TestBed.inject(PopoverController) as jasmine.SpyObj<PopoverController>;
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
    popoverController.dismiss.and.returnValue(Promise.resolve(true));
    const closeButton = getElementBySelector(fixture, '.fy-icon-close') as HTMLButtonElement;
    closeButton.click();
    expect(popoverController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('saveReportName(): should call saveReportName method when save button is clicked', () => {
    popoverController.dismiss.and.returnValue(Promise.resolve(true));
    const saveButton = getElementBySelector(fixture, '.edit-report-name--toolbar__btn-save') as HTMLButtonElement;
    fixture.detectChanges();
    saveButton.click();
    expect(popoverController.dismiss).toHaveBeenCalledOnceWith({ reportName: 'Report 1' });
  });
});
