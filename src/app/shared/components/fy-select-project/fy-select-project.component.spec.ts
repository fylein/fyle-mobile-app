import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { FySelectProjectComponent } from './fy-select-project.component';
import { FyProjectSelectModalComponent } from './fy-select-modal/fy-select-project-modal.component';
import { By } from '@angular/platform-browser';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { click, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('FySelectProjectComponent', () => {
  let component: FySelectProjectComponent;
  let fixture: ComponentFixture<FySelectProjectComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);

    TestBed.configureTestingModule({
      declarations: [FySelectProjectComponent],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule, MatIconModule, MatIconTestingModule],
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
    }).compileComponents();
    fixture = TestBed.createComponent(FySelectProjectComponent);
    component = fixture.componentInstance;

    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('valid(): should return validity of parent if touched is false', () => {
    component.touchedInParent = true;
    component.validInParent = false;

    const res = component.valid;
    expect(res).toEqual(true);
  });

  it('openModal(): should open select vendor modal', async () => {
    modalProperties.getModalDefaultProperties.and.returnValue({
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
    const projectModalSpy = jasmine.createSpyObj('projectModal', ['present', 'onWillDismiss']);
    projectModalSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          value: 'value1',
        },
      })
    );
    modalController.create.and.returnValue(Promise.resolve(projectModalSpy));

    await component.openModal();

    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: FyProjectSelectModalComponent,
      componentProps: {
        currentSelection: undefined,
        cacheName: component.cacheName,
        selectionElement: component.selectionElement,
        categoryIds: component.categoryIds,
        defaultValue: component.defaultValue,
        recentlyUsed: component.recentlyUsed,
        label: component.label,
      },
      mode: 'ios',
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
    expect(modalProperties.getModalDefaultProperties).toHaveBeenCalledTimes(1);
    expect(component.value).toEqual('value1');
  });

  it('onBlur(): should call a function when onBlur fires and registerOnTouched to trigger', () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    spyOn(component, 'onBlur').and.callThrough();
    component.registerOnTouched(callbackFn);

    const inputElement = fixture.debugElement.query(By.css('.fy-select-project--input'));
    inputElement.nativeElement.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(callbackFn).toHaveBeenCalledTimes(1);
    expect(component.onBlur).toHaveBeenCalledTimes(1);
  });

  describe('writeValue():', () => {
    it('should overwrite value', () => {
      component.innerValue = 'value2';
      fixture.detectChanges();

      component.writeValue(['value']);
      expect(component.innerValue).toEqual(['value']);
    });

    it('should set display value to empty', () => {
      component.innerValue = 'value';
      fixture.detectChanges();

      component.writeValue(undefined);
      expect(component.displayValue).toEqual('');
    });
  });

  it('registerOnChange():should trigger on change callback when value changes', async () => {
    const callbackFn = jasmine.createSpy('callbackFn');
    component.registerOnChange(callbackFn);

    const projectModalSpy = jasmine.createSpyObj('projectModal', ['present', 'onWillDismiss']);
    projectModalSpy.onWillDismiss.and.returnValue(
      Promise.resolve({
        data: {
          value: 'value1',
        },
      })
    );
    modalController.create.and.returnValue(Promise.resolve(projectModalSpy));

    modalProperties.getModalDefaultProperties.and.callThrough();

    await component.openModal();
    await fixture.detectChanges();

    expect(callbackFn).toHaveBeenCalledOnceWith('value1');
  });

  it('should open modal when clicked on', () => {
    spyOn(component, 'openModal');
    const input = getElementBySelector(fixture, '.fy-select-project--input') as HTMLElement;

    click(input);
    expect(component.openModal).toHaveBeenCalledTimes(1);
  });

  it('should show label', () => {
    component.label = 'Label';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.text-capitalize'))).toEqual('Label');
  });

  it('should check if an input field is valid', () => {
    component.mandatory = true;
    fixture.detectChanges();

    const validMesage = getElementBySelector(fixture, '.fy-select-project--input-invalid');
    expect(validMesage).toBeNull();
  });
});
