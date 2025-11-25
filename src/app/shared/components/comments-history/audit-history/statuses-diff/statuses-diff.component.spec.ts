import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { getAllElementsBySelector, getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { SnakeCaseToSpaceCase } from 'src/app/shared/pipes/snake-case-to-space-case.pipe';

import { StatusesDiffComponent } from './statuses-diff.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
describe('StatusesDiffComponent', () => {
  let component: StatusesDiffComponent;
  let fixture: ComponentFixture<StatusesDiffComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    TestBed.configureTestingModule({
      imports: [ TranslocoModule, StatusesDiffComponent, SnakeCaseToSpaceCase],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusesDiffComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'statusesDiff.mileageRateName': 'Mileage Rate Name',
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isValueList to true if value is an array', () => {
    fixture.componentRef.setInput('value', ['saniruddha.s+1@fyle.in', 'aaaaasdjskjd@sdsd.com', 'ajain+12+12+1@fyle.in']);
    component.ngOnInit();
    expect(component.isValueList).toBeTrue();
  });

  it('should set isValueList to false if value is not an array', () => {
    fixture.componentRef.setInput('value', 4000);
    component.ngOnInit();
    expect(component.isValueList).toBeFalse();
  });

  it('should render key and value as list items if value is an array', () => {
    fixture.componentRef.setInput('key', 'User List');
    fixture.componentRef.setInput('value', ['saniruddha.s+1@fyle.in', 'aaaaasdjskjd@sdsd.com', 'ajain+12+12+1@fyle.in']);
    component.isValueList = undefined;
    component.displayValue = undefined;
    component.ngOnInit();
    fixture.detectChanges();
    const listItems = getAllElementsBySelector(fixture, 'li');
    expect(listItems.length).toEqual(3);
    expect(getTextContent(listItems[0])).toEqual('saniruddha.s+1@fyle.in');
    expect(getTextContent(listItems[1])).toEqual('aaaaasdjskjd@sdsd.com');
    expect(getTextContent(listItems[2])).toEqual('ajain+12+12+1@fyle.in');
  });

  it('should render key and value as plain text if value is not an array', () => {
    fixture.componentRef.setInput('key', 'Distance');
    fixture.componentRef.setInput('value', 4000);
    component.isValueList = undefined;
    component.displayValue = undefined;
    component.ngOnInit();
    fixture.detectChanges();
    const listItem = getElementBySelector(fixture, 'li');
    expect(getTextContent(listItem)).toEqual('Distance : 4000');
  });

  it('should render key as Mileage Rate Name if key is vehicle type', fakeAsync(() => {
    fixture.componentRef.setInput('key', 'vehicle type');
    fixture.componentRef.setInput('value', 'Two Wheeler');
    component.isValueList = undefined;
    component.displayValue = undefined;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const listItem = getElementBySelector(fixture, 'li');
    expect(getTextContent(listItem)).toEqual('Mileage Rate Name : Two Wheeler');
  }));

  it('should render Please contact your admin to configure the following key correctly', () => {
    fixture.componentRef.setInput('key', 'Please contact your admin to configure the following');
    fixture.componentRef.setInput('value', ['Designated Level Approver']);
    component.ngOnInit();
    fixture.detectChanges();
    const title = getElementBySelector(fixture, 'span');
    expect(getTextContent(title)).toEqual('Please contact your admin to configure the following');
  });

  it('should render Violating Transactions key correctly', () => {
    fixture.componentRef.setInput('key', 'Violating Transactions');
    fixture.componentRef.setInput('value', ['E/2022/10/T/14 (INR 555, Flight)', 'E/2022/10/T/18 (INR 128, Mileage)']);
    component.ngOnInit();
    fixture.detectChanges();
    const title = getElementBySelector(fixture, 'span.statuses-diff--violating-txns');
    expect(getTextContent(title)).toEqual('Violating Transactions');
  });
});
