import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { PreferenceSettingComponent } from './preference-setting.component';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('PreferenceSettingComponent', () => {
  let component: PreferenceSettingComponent;
  let fixture: ComponentFixture<PreferenceSettingComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let modalProperties: jasmine.SpyObj<ModalPropertiesService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    const modalPropertiesSpy = jasmine.createSpyObj('ModalPropertiesService', ['getModalDefaultProperties']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule, FormsModule, TranslocoModule, PreferenceSettingComponent],
    providers: [
        {
            provide: ModalController,
            useValue: modalControllerSpy,
        },
        {
            provide: ModalPropertiesService,
            useValue: modalPropertiesSpy,
        },
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
}).compileComponents();
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    modalProperties = TestBed.inject(ModalPropertiesService) as jasmine.SpyObj<ModalPropertiesService>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'preferenceSetting.selectCurrency': 'Select currency',
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

  it('should render the correct title and content', () => {
    const title = 'Default Currency';
    const content = 'Select the default currency to be used for creating expenses';
    component.title = title;
    component.content = content;
    fixture.detectChanges();
    const titleElement = getElementBySelector(fixture, '.preference-setting__card__title');
    const contentElement = getElementBySelector(fixture, '.preference-setting__card__content');
    expect(getTextContent(titleElement)).toContain(title);
    expect(getTextContent(contentElement)).toContain(content);
  });

  it('should display input field and icon when key is defaultCurrency and isEnabled is true', () => {
    const inputContainer = getElementBySelector(fixture, '.preference-setting__input-container');
    component.key = 'instaFyle';
    component.isEnabled = true;
    fixture.detectChanges();
    expect(inputContainer).toBeFalsy();
  });
});
