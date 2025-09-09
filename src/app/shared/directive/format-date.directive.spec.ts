import { Component, DebugElement, Renderer2 } from '@angular/core';
import { FormatDateDirective } from './format-date.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';

@Component({ template: `<input appFormatDate type="date" />`, })
class TestFormatDateDirectiveComponent {}

describe('FormatDateDirective', () => {
  let component: TestFormatDateDirectiveComponent;
  let fixture: ComponentFixture<TestFormatDateDirectiveComponent>;
  let inputEl: DebugElement;
  let directive: FormatDateDirective;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
    imports: [TestFormatDateDirectiveComponent, FormatDateDirective],
    providers: [
        {
            provide: TranslocoService,
            useValue: translocoServiceSpy,
        },
    ],
});

    fixture = TestBed.createComponent(TestFormatDateDirectiveComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
    directive = inputEl.injector.get(FormatDateDirective);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'directives.formatDate.selectNamePlaceholder': 'Select {{name}}',
        'directives.formatDate.selectDatePlaceholder': 'Select date',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params && params.name) {
        translation = translation.replace('{{name}}', params.name);
      }

      return translation;
    });
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('get selectedElement(): should return the current html element', () => {
    const selectedElement = inputEl.nativeElement;
    expect(directive.selectedElement).toEqual(selectedElement);
  });

  it('onChange(): should call modifyDisplayValue once', () => {
    spyOn(directive, 'modifyDisplayValue');
    directive.onChange('2023-01-02');
    expect(directive.modifyDisplayValue).toHaveBeenCalledOnceWith('2023-01-02');
  });

  it('ngOnInit(): should call modifyDisplayValue once with the initial value', () => {
    spyOn(directive, 'modifyDisplayValue');
    directive.ngOnInit();
    expect(directive.modifyDisplayValue).toHaveBeenCalledOnceWith('');
  });

  describe('modifyDisplayValue()', () => {
    it('should remove class date-input__placeholder and set data-date attribute to date provided in the input', () => {
      directive.modifyDisplayValue('2023-01-02');
      expect(inputEl.nativeElement.getAttribute('data-date')).toEqual('Jan 02, 2023');
      expect(inputEl.nativeElement.classList.contains('date-input__placeholder')).toBeFalse();
    });

    it('should add class date-input__placeholder and set data-date attribute to Select date if no name attribute is present', () => {
      directive.modifyDisplayValue('');
      expect(inputEl.nativeElement.getAttribute('data-date')).toEqual('Select date');
      expect(inputEl.nativeElement.classList.contains('date-input__placeholder')).toBeTrue();
    });

    it('should add class date-input__placeholder and set data-date attribute to Select journey date if name attribute is equal to journey date', () => {
      inputEl.nativeElement.name = 'journey date';
      directive.modifyDisplayValue('');
      expect(inputEl.nativeElement.getAttribute('data-date')).toEqual('Select journey date');
      expect(inputEl.nativeElement.classList.contains('date-input__placeholder')).toBeTrue();
    });
  });
});
