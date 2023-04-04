import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PreferenceSettingComponent } from './preference-setting.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { SelectCurrencyComponent } from '../select-currency/select-currency.component';
import { Currency } from 'src/app/core/models/currency.model';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('PreferenceSettingComponent', () => {
  let component: PreferenceSettingComponent;
  let fixture: ComponentFixture<PreferenceSettingComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;

  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    TestBed.configureTestingModule({
      declarations: [PreferenceSettingComponent],
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
    }).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;

    fixture = TestBed.createComponent(PreferenceSettingComponent);
    component = fixture.componentInstance;
    component.defaultCurrency = 'ARS';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an event with key and isEnabled when onChange() is called', () => {
    spyOn(component.preferenceChanged, 'emit');
    component.key = 'instaFyle';
    component.isEnabled = true;
    component.onChange();
    expect(component.preferenceChanged.emit).toHaveBeenCalledOnceWith({ key: 'instaFyle', isEnabled: true });
  });

  it('openCurrencyModal(): should open the currency modal', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('HTMLIonModalElement', ['present', 'onWillDismiss']);
    const selectedCurrency: Currency = { shortCode: 'ARS', longName: 'Argentine Peso' };
    modalController.create.and.returnValue(Promise.resolve(modalSpy));
    modalSpy.onWillDismiss.and.returnValue(Promise.resolve({ data: { selectedCurrency } } as any));

    component.openCurrencyModal();
    tick();
    expect(modalController.create).toHaveBeenCalledOnceWith({
      component: SelectCurrencyComponent,
      componentProps: {
        currentSelection: component.defaultCurrency,
      },
      mode: 'ios',
      ...modalProperties.getModalDefaultProperties(),
    });
    expect(modalSpy.present).toHaveBeenCalledTimes(1);
    expect(component.defaultCurrency).toEqual(selectedCurrency.shortCode);
  }));

  it('should render the correct title and content', () => {
    component.title = 'Default Currency';
    component.content = 'Select the default currency to be used for creating expenses';
    fixture.detectChanges();
    const titleElement = getElementBySelector(fixture, '.preference-setting__card__title');
    const contentElement = getElementBySelector(fixture, '.preference-setting__card__content');
    expect(getTextContent(titleElement)).toContain('Default Currency');
    expect(getTextContent(contentElement)).toContain('Select the default currency to be used for creating expenses');
  });

  it('should display input field and icon when key is defaultCurrency and isEnabled is true', () => {
    const inputContainer = getElementBySelector(fixture, '.preference-setting__input-container');
    component.key = 'instaFyle';
    component.isEnabled = true;
    fixture.detectChanges();
    expect(inputContainer).toBeFalsy();
  });
});
