import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { FyMultiselectModalComponent } from './fy-multiselect-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatChipInputEvent,
  MatChipsModule,
} from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { click, getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';

describe('FyMultiselectModalComponent', () => {
  let component: FyMultiselectModalComponent;
  let fixture: ComponentFixture<FyMultiselectModalComponent>;
  let modalController: jasmine.SpyObj<ModalController>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      declarations: [FyMultiselectModalComponent],
      imports: [
        IonicModule.forRoot(),
        MatIconTestingModule,
        MatIconModule,
        MatCheckboxModule,
        MatChipsModule,
        MatFormFieldModule,
        FormsModule,
        BrowserAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        {
          provide: ModalController,
          useValue: modalControllerSpy,
        },
        {
          provide: ChangeDetectorRef,
          useValue: cdrSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FyMultiselectModalComponent);
    component = fixture.componentInstance;
    modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    cdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'fyMultiselectModal.selectItems': 'Select Items',
        'fyMultiselectModal.allItems': 'All Items',
        'fyMultiselectModal.done': 'Done',
        'fyMultiselectModal.multiSelect': 'Multi select',
        'fyMultiselectModal.search': 'Search',
        'fyMultiselectModal.countSelected': '{{count}} selected',
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
    component.options = [
      {
        label: 'Label1',
        value: 'value1',
        selected: true,
      },
      {
        label: 'Label2',
        value: 'value2',
        selected: false,
      },
    ];

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearValue(): should clear value ', () => {
    const input = getElementBySelector(fixture, '.selection-modal--form-input') as HTMLInputElement;

    component.clearValue();
    expect(component.value).toEqual('');
    expect(input.value).toEqual('');
  });

  it('addChip(): should add material chip', () => {
    const inputElement = getElementBySelector(fixture, '.selection-modal--form-input') as HTMLInputElement;
    const chipInput = jasmine.createSpyObj('chipInput', ['clear']);
    const event: MatChipInputEvent = {
      value: 'label',
      chipInput,
      input: inputElement,
    };
    component.addChip(event);
    fixture.detectChanges();
    expect(chipInput.clear).toHaveBeenCalledTimes(1);
  });

  it('removeChip(): should remove chip', () => {
    spyOn(component, 'onElementSelected').and.returnValue(null);

    component.removeChip('value');
    expect(component.onElementSelected).toHaveBeenCalledOnceWith({
      label: 'value',
      selected: false,
      value: 'value',
    });
  });

  it('onDoneClick(): should dismiss modal', () => {
    modalController.dismiss.and.resolveTo(true);

    component.onDoneClick();
    expect(modalController.dismiss).toHaveBeenCalledTimes(1);
  });

  it('onElementSelected(): should initialise current selections', () => {
    component.onElementSelected({
      label: 'Label1',
      value: 'value1',
      selected: true,
    });

    expect(component.currentSelections).toEqual(['value1']);
  });

  it('useSelected(): dismiss modal and save the current selection', () => {
    modalController.dismiss.and.resolveTo(true);

    component.useSelected();
    expect(modalController.dismiss).toHaveBeenCalledOnceWith({
      selected: component.options.filter((option) => option.selected),
    });
  });

  it('should check whether information is displayed properly', () => {
    component.selectModalHeader = 'Header';
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--title'))).toEqual('Header');
  });

  it('should dismiss modal if clicked on done CTA', () => {
    spyOn(component, 'onDoneClick');

    const doneCTA = getElementBySelector(fixture, '[data-testid="doneRef"]') as HTMLElement;
    click(doneCTA);
    expect(component.onDoneClick).toHaveBeenCalledTimes(1);
  });

  it('should close modal and save the current selected items', () => {
    spyOn(component, 'useSelected');

    const doneButton = getElementBySelector(fixture, '.selection-modal--cta') as HTMLElement;
    click(doneButton);
    expect(component.useSelected).toHaveBeenCalledTimes(1);
  });

  it('should display current selected items', () => {
    component.currentSelections = ['value1'];
    fixture.detectChanges();

    const chips = getAllElementsBySelector(fixture, '[data-testid="chips"]');
    expect(chips.length).toEqual(component.currentSelections.length);
  });

  it('should show the number of current selected items', fakeAsync(() => {
    component.currentSelections = ['value1', 'value2'];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(getTextContent(getElementBySelector(fixture, '.selection-modal--selected-count'))).toEqual('2 selected');
  }));

  it('should show all available options', () => {
    const options = getAllElementsBySelector(fixture, '.selection-modal--list-element');

    expect(getTextContent(options[0])).toEqual(component.options[0].label);
    expect(options.length).toEqual(component.options.length);
  });
});
