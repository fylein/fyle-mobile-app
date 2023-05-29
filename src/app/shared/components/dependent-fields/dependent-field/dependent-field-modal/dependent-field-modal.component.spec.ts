import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { DependentFieldModalComponent } from './dependent-field-modal.component';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, skip, take } from 'rxjs';
import {
  dependentFieldOptions,
  dependentFieldOptionsWithSelection,
  dependentFieldOptionsWithSelectionNotInList,
  dependentFieldOptionsWithoutSelection,
} from 'src/app/core/mock-data/dependent-field-option.data';
import { FyZeroStateComponent } from '../../../fy-zero-state/fy-zero-state.component';
import { FyHighlightTextComponent } from '../../../fy-highlight-text/fy-highlight-text.component';
import { dependentFieldValues } from 'src/app/core/mock-data/dependent-field-value.data';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DependentFieldModalComponent', () => {
  let component: DependentFieldModalComponent;
  let modalElement: DebugElement;
  let fixture: ComponentFixture<DependentFieldModalComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);

    TestBed.configureTestingModule({
      declarations: [DependentFieldModalComponent, FyZeroStateComponent, FyHighlightTextComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatIconTestingModule,
        MatIconModule,
        MatInputModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DependentFieldModalComponent);
        component = fixture.componentInstance;
        modalElement = fixture.debugElement;
        modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
        dependentFieldsService = TestBed.inject(DependentFieldsService) as jasmine.SpyObj<DependentFieldsService>;

        component.fieldId = 221309;
        component.parentFieldId = 221284;
        component.parentFieldValue = 'Project 1';
        component.currentSelection = 'Other Dep. Value 1';
        component.searchBarRef = modalElement.query(By.css('.dependent-field-modal__search-input'));
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngAfterViewInit(): should set filteredOptions$', (done) => {
    const userEnteredValue = ['cost', 'cost code 3'];

    spyOn(component, 'getDependentFieldOptions').and.returnValues(
      of(dependentFieldOptionsWithoutSelection),
      of(dependentFieldOptionsWithoutSelection),
      of(dependentFieldOptionsWithoutSelection.slice(0, 2))
    );
    component.ngAfterViewInit();

    component.searchBarRef.nativeElement.value = userEnteredValue[0];
    component.searchBarRef.nativeElement.dispatchEvent(new KeyboardEvent('keyup'));

    //Compare result for the first value emitted by the observable
    component.filteredOptions$.pipe(take(1)).subscribe((result) => {
      expect(result).toEqual(dependentFieldOptionsWithoutSelection);
    });

    //Compare result for the second value emitted by the observable
    component.filteredOptions$.pipe(skip(1), take(1)).subscribe((result) => {
      expect(result).toEqual(dependentFieldOptionsWithoutSelection.slice(0, 2));
      done();
    });

    setTimeout(() => {
      component.searchBarRef.nativeElement.value = userEnteredValue[1];
      component.searchBarRef.nativeElement.dispatchEvent(new KeyboardEvent('keyup'));
    }, 500);
  });

  it('getDependentFieldOptions(): should return dependent field options based on search query', (done) => {
    const searchQuery = '';
    const { fieldId, parentFieldId, parentFieldValue } = component;

    dependentFieldsService.getOptionsForDependentField
      .withArgs({
        fieldId,
        parentFieldId,
        parentFieldValue,
        searchQuery,
      })
      .and.returnValue(of(dependentFieldValues));
    spyOn(component, 'getFinalDependentFieldValues').and.returnValue(dependentFieldOptionsWithSelection);

    component.getDependentFieldOptions(searchQuery).subscribe((result) => {
      expect(dependentFieldsService.getOptionsForDependentField).toHaveBeenCalledOnceWith({
        fieldId,
        parentFieldId,
        parentFieldValue,
        searchQuery,
      });
      expect(component.getFinalDependentFieldValues).toHaveBeenCalledOnceWith(
        dependentFieldOptions,
        component.currentSelection
      );

      expect(result).toEqual(dependentFieldOptionsWithSelection);

      done();
    });
  });

  it('getFinalDependentFieldValues(): should return values with None option if no value is selected', () => {
    expect(component.getFinalDependentFieldValues(dependentFieldOptions, null)).toEqual(
      dependentFieldOptionsWithoutSelection
    );
  });

  it('getFinalDependentFieldValues(): should set selected to true if currentSelection is provided', () => {
    const selectedOption = 'Other Dep. Value 1';
    expect(component.getFinalDependentFieldValues(dependentFieldOptions, selectedOption)).toEqual(
      dependentFieldOptionsWithSelection
    );
  });

  it('getFinalDependentFieldValues(): should add selected option to start of list if it is not present', () => {
    const selectedOption = 'Other Dep. Value 51';
    expect(component.getFinalDependentFieldValues(dependentFieldOptions, selectedOption)).toEqual(
      dependentFieldOptionsWithSelectionNotInList
    );
  });

  it('clearValue(): Should clear the searchbar', () => {
    component.value = 'Dependent field 3';
    component.clearValue();
    expect(component.value).toEqual('');
    expect(component.searchBarRef.nativeElement.value).toEqual('');
  });

  it('onDoneClick(): should dismiss modal', fakeAsync(() => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));
    component.onDoneClick();
    tick(500);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('onElementSelect(): should dismiss modal with selected option', fakeAsync(() => {
    modalController.dismiss.and.returnValue(Promise.resolve(true));
    component.onElementSelect(dependentFieldOptions[0]);
    tick(500);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(dependentFieldOptions[0]);
  }));
});
