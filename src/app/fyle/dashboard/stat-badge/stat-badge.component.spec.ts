import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ReportStates } from './report-states';

import { StatBadgeComponent } from './stat-badge.component';

describe('StatBadgeComponent', () => {
  let component: StatBadgeComponent;
  let fixture: ComponentFixture<StatBadgeComponent>;

  beforeEach(waitForAsync(() => {
    const fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    TestBed.configureTestingModule({
      declarations: [StatBadgeComponent, HumanizeCurrencyPipe, FyCurrencyPipe],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: FyCurrencyPipe,
          useValue: fyCurrencyPipeSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StatBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template():', () => {
    it('should display the name', () => {
      component.name = 'Test Name';
      fixture.detectChanges();
      const nameElement = getElementBySelector(fixture, '.stat-badge--name');
      expect(getTextContent(nameElement)).toContain('Test Name');
    });

    it('should display the count', () => {
      component.count = 123;
      component.reportState = ReportStates.APPROVED;
      fixture.detectChanges();
      const countElement = getElementBySelector(fixture, '.stat-badge--count');
      expect(getTextContent(countElement)).toContain('123');
    });

    it('should display the expense state count', () => {
      component.count = 456;
      component.expenseState = 'Approved';
      fixture.detectChanges();
      const countElement = getElementBySelector(fixture, '.stat-badge--count');
      expect(getTextContent(countElement)).toContain('456');
      expect(countElement.classList).toContain('stat-badge--count__approved');
    });

    it('should display the value with currency', () => {
      component.currency = 'USD';
      component.currencySymbol = '$';
      component.value = 1234.56;
      fixture.detectChanges();
      const amountElement = getElementBySelector(fixture, '.stat-badge--amount');
      expect(amountElement).toBeTruthy();
    });
  });

  describe('onBadgeClicked():', () => {
    it('should emit badgeClicked event on click', () => {
      spyOn(component.badgeClicked, 'emit');
      component.onBadgeClicked();
      expect(component.badgeClicked.emit).toHaveBeenCalled();
    });

    it('should emit badgeClicked event on click with expense state', () => {
      component.expenseState = 'Approved';
      fixture.detectChanges();
      spyOn(component.badgeClicked, 'emit');
      component.onBadgeClicked();
      expect(component.badgeClicked.emit).toHaveBeenCalled();
    });

    it('should not emit badgeClicked event if loading is true', () => {
      spyOn(component.badgeClicked, 'emit');
      component.loading = true;
      component.onBadgeClicked();
      expect(component.badgeClicked.emit).not.toHaveBeenCalled();
    });
  });
});
