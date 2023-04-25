import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { DependentFieldComponent } from './dependent-field.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { DependentFieldModalComponent } from './dependent-field-modal/dependent-field-modal.component';
import { FormsModule } from '@angular/forms';

fdescribe('DependentFieldComponent', () => {
  let component: DependentFieldComponent;
  let fixture: ComponentFixture<DependentFieldComponent>;
  let componentElement: DebugElement;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
  const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DependentFieldComponent, DependentFieldModalComponent],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ModalPropertiesService,
          useValue: modalPropertiesSpy,
        },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DependentFieldComponent);
        component = fixture.componentInstance;
        componentElement = fixture.debugElement;

        modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
        modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

        fixture.detectChanges();
      });
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  xit('openModal', () => {});

  it('onBlur(): component should be touched', () => {
    spyOn(component, 'onTouchedCallback');
    const inputElement = componentElement.query(By.css('.dependent-field__input'));
    inputElement.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(component.onTouchedCallback).toHaveBeenCalledTimes(1);
    expect(inputElement.nativeElement.classList.contains('ng-touched')).toBe(true);
  });

  it('writeValue(): should write the formControl value to select field', () => {
    const dependentFieldValue = 'Dep Field 1';
    component.writeValue(dependentFieldValue);
    expect(component.displayValue).toEqual(dependentFieldValue);
  });

  xit('registerOnChange', () => {});

  xit('registerOnTouched', () => {});
});
