import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

import { AutoSubmissionInfoCardComponent } from './auto-submission-info-card.component';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { OrgSettings } from 'src/app/core/models/org-settings.model';

describe('AutoSubmissionInfoCardComponent', () => {
  let component: AutoSubmissionInfoCardComponent;
  let fixture: ComponentFixture<AutoSubmissionInfoCardComponent>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  beforeEach(waitForAsync(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate'], {
      config: {
        reRenderOnLangChange: true,
      },
      langChanges$: of('en'),
      _loadDependencies: () => Promise.resolve(),
    });
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllMap']);
    currencyServiceSpy.getHomeCurrency.and.returnValue(of('USD'));
    expenseFieldsServiceSpy.getAllMap.and.returnValue(
      of({
        project_id: [{ field_name: 'Project' }],
        cost_center_id: [{ field_name: 'Cost center' }],
      }),
    );
    TestBed.configureTestingModule({
      imports: [TranslocoModule, AutoSubmissionInfoCardComponent],
      providers: [
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoSubmissionInfoCardComponent);
    component = fixture.componentInstance;
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'autoSubmissionInfoCard.nextSubmissionOn': 'Next submission on',
        'autoSubmissionInfoCard.completeExpenses': 'Complete expenses',
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
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onCardClicked(): should emit cardClicked event when card is clicked', () => {
    spyOn(component.cardClicked, 'emit');
    const infoCardContainer = getElementBySelector(fixture, '.info-card__container') as HTMLElement;
    infoCardContainer.click();
    expect(component.cardClicked.emit).toHaveBeenCalled();
  });

  it('should display the correct date in the template', () => {
    const expectedDate = new Date('2022-11-30T17:31:52.261Z');
    component.autoSubmissionReportDate = expectedDate;
    fixture.detectChanges();
    const infoCardDate = getElementBySelector(fixture, '.info-card__date');
    expect(getTextContent(infoCardDate)).toBe('Nov 30, 2022');
  });

  it('should return true when date is present', () => {
    component.autoSubmissionReportDate = new Date('2024-01-01T00:00:00.000Z');

    expect(component.showAutoSubmissionInfo()).toBeTrue();
  });

  it('should return false when date is not present', () => {
    component.autoSubmissionReportDate = undefined;

    expect(component.showAutoSubmissionInfo()).toBeFalse();
  });

  it('should return true when grouping dimensions exist', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: ['project_id'],
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showGroupingInfo()).toBeTrue();
  });

  it('should return false when grouping dimensions are empty', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: [],
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showGroupingInfo()).toBeFalse();
  });

  it('should return true when auto approval is allowed and enabled', () => {
    const orgSettings = {
      auto_report_approval_settings: {
        allowed: true,
        enabled: true,
        amount_threshold: 100,
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showAutoApprovalInfo()).toBeTrue();
    expect(component.autoApprovalThreshold()).toBe(100);
  });

  it('should return false when auto approval is disabled', () => {
    const orgSettings = {
      auto_report_approval_settings: {
        allowed: true,
        enabled: false,
        amount_threshold: 100,
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showAutoApprovalInfo()).toBeFalse();
  });

  it('should map and format dimensions', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: ['project_id', 'cost_center_id', 'merchant_id'],
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.groupingDimensionLabel()).toBe('Project, Cost center, merchant id');
  });

  it('should return empty grouping label when no dimensions', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: [],
      },
    } as OrgSettings;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.groupingDimensionLabel()).toBe('');
  });

  it('should return true when two or more sections are enabled', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: ['project_id'],
      },
      auto_report_approval_settings: {
        allowed: true,
        enabled: true,
        amount_threshold: 100,
      },
    } as OrgSettings;
    component.autoSubmissionReportDate = new Date('2024-01-01T00:00:00.000Z');
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showDetailedInfoCard()).toBeTrue();
  });

  it('should return false when fewer than two sections are enabled', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: [],
      },
      auto_report_approval_settings: {
        allowed: true,
        enabled: false,
        amount_threshold: 100,
      },
    } as OrgSettings;
    component.autoSubmissionReportDate = undefined;
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    expect(component.showDetailedInfoCard()).toBeFalse();
  });

  it('should render detailed card when multiple sections are enabled', () => {
    const orgSettings = {
      auto_report_submission_settings: {
        expense_grouping_dimensions: ['project_id'],
      },
      auto_report_approval_settings: {
        allowed: true,
        enabled: true,
        amount_threshold: 100,
      },
    } as OrgSettings;
    component.autoSubmissionReportDate = new Date('2024-01-01T00:00:00.000Z');
    fixture.componentRef.setInput('orgSettings', orgSettings);
    fixture.detectChanges();

    const detailedHeader = getElementBySelector(fixture, '.info-card__title');
    expect(detailedHeader).toBeTruthy();
    const listItems = fixture.nativeElement.querySelectorAll('.info-card__list li');
    expect(listItems.length).toBe(3);
  });
});
