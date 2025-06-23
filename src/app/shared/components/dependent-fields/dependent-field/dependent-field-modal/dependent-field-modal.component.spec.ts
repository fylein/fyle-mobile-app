import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';

import { DependentFieldModalComponent } from './dependent-field-modal.component';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
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
import { ChangeDetectorRef, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HighlightPipe } from 'src/app/shared/pipes/highlight.pipe';

describe('DependentFieldModalComponent', () => {
  let component: DependentFieldModalComponent;
  let modalElement: DebugElement;
  let fixture: ComponentFixture<DependentFieldModalComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;
  let modalController: jasmine.SpyObj<ModalController>;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [DependentFieldModalComponent, FyZeroStateComponent, FyHighlightTextComponent, HighlightPipe],
      imports: [
        IonicModule.forRoot(),
        MatIconModule,
        MatFormFieldModule,
        FormsModule,
        MatIconTestingModule,
        MatIconModule,
        MatInputModule,
        BrowserAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        ChangeDetectorRef,
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: DependentFieldsService,
          useValue: dependentFieldsServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
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
        translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
        translocoService.translate.and.callFake((key: any, params?: any) => {
          const translations: { [key: string]: string } = {
            'dependentFieldModal.none': 'None',
            'dependentFieldModal.selectLabel': 'Select {{label}}',
            'dependentFieldModal.search': 'Search',
            'dependentFieldModal.clear': 'Clear',
            'dependentFieldModal.noResultFound': 'No result found for {{label}}',
            'dependentFieldModal.searchOrSelect': 'Try searching or selecting a different {{label}}',
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

  xit('ngAfterViewInit(): should set filteredOptions$', (done) => {
    const userEnteredValue = ['cost', 'cost code 3'];
    const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');

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
    });

    setTimeout(() => {
      component.searchBarRef.nativeElement.value = userEnteredValue[1];
      component.searchBarRef.nativeElement.dispatchEvent(new KeyboardEvent('keyup'));
    }, 500);
    expect(detectChangesSpy).toHaveBeenCalledTimes(3);
    done();
  });

  xit('getDependentFieldOptions(): should return dependent field options based on search query', (done) => {
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
    modalController.dismiss.and.resolveTo(true);
    component.onDoneClick();
    tick(500);
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  }));

  it('onElementSelect(): should dismiss modal with selected option', fakeAsync(() => {
    modalController.dismiss.and.resolveTo(true);
    component.onElementSelect(dependentFieldOptions[0]);
    tick(500);
    expect(modalController.dismiss).toHaveBeenCalledOnceWith(dependentFieldOptions[0]);
  }));
});
