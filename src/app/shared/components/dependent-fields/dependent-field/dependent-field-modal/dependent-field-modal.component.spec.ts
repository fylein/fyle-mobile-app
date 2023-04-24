import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { DependentFieldModalComponent } from './dependent-field-modal.component';
import { DependentFieldsService } from 'src/app/core/services/dependent-fields.service';
import { FormsModule } from '@angular/forms';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import {
  dependentFieldOptions,
  dependentFieldOptionsWithSelection,
  dependentFieldOptionsWithSelectionNotInList,
  dependentFieldOptionsWithoutSelection,
} from 'src/app/core/mock-data/dependent-field-option.data';

fdescribe('DependentFieldModalComponent', () => {
  let component: DependentFieldModalComponent;
  let fixture: ComponentFixture<DependentFieldModalComponent>;
  let dependentFieldsService: jasmine.SpyObj<DependentFieldsService>;

  const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
  const dependentFieldsServiceSpy = jasmine.createSpyObj('DependentFieldsService', ['getOptionsForDependentField']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DependentFieldModalComponent],
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
        spyOn(component, 'getDependentFieldOptions').and.returnValue(of([]));
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getFinalDependentFieldValues(): should returns values with None option if no value is selected', () => {
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
});
