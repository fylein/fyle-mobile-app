import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { filter, of, reduce, Subject, switchMap, take } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { ExactCurrencyPipe } from 'src/app/shared/pipes/exact-currency.pipe';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskIcon } from '../models/task-icon.enum';
import {
  allExtendedReportsResponse,
  extendedOrgUserResponse,
  extendedOrgUserResponseSpender,
  incompleteExpensesResponse,
  potentialDuplicatesApiResponse,
  sentBackAdvancesResponse,
  sentBackResponse,
  teamReportResponse,
  unsubmittedReportsResponse,
} from '../test-data/tasks.service.spec.data';
import { AdvanceRequestService } from './advance-request.service';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { ReportService } from './report.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';

import { TasksService } from './tasks.service';
import { UserEventService } from './user-event.service';

import {
  draftExpenseTaskSample,
  potentailDuplicateTaskSample,
  teamReportTaskSample,
  sentBackReportTaskSample,
  unreportedExpenseTaskSample,
  unsubmittedReportTaskSample,
  sentBackAdvanceTaskSample,
  addMobileNumberTask,
  verifyMobileNumberTask,
  draftExpenseTaskSample2,
  unreportedExpenseTaskSample2,
  commuteDeductionTask,
  sentBackReportTaskSingularSample,
  verifyMobileNumberTask2,
} from '../mock-data/task.data';
import { mastercardRTFCard, statementUploadedCard, visaRTFCard } from '../mock-data/platform-corporate-card.data';
import { OrgSettingsService } from './org-settings.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { expenseDuplicateSets } from '../mock-data/platform/v1/expense-duplicate-sets.data';
import { completeStats, incompleteStats } from '../mock-data/platform/v1/expenses-stats.data';
import { EmployeesService } from './platform/v1/spender/employees.service';
import {
  orgSettingsRes,
  orgSettingsWithCommuteDeductionsDisabled,
  orgSettingsWithCommuteDeductionsEnabled,
  orgSettingsWoMileage,
} from '../mock-data/org-settings.data';
import {
  commuteDetailsResponseData,
  commuteDetailsResponseData2,
  commuteDetailsResponseData3,
} from '../mock-data/commute-details-response.data';
import { orgSettingsPendingRestrictions } from '../mock-data/org-settings.data';
import { SpenderReportsService } from './platform/v1/spender/reports.service';
import { ApproverReportsService } from './platform/v1/approver/reports.service';
import { PlatformReportsStatsResponse } from '../models/platform/v1/report-stats-response.model';
import {
  expectedReportStats,
  expectedSentBackResponse,
  expectedSentBackResponseSingularReport,
} from '../mock-data/report-stats.data';
import { OrgService } from './org.service';
import { orgData1 } from '../mock-data/org.data';
import { UtilityService } from './utility.service';
import { TranslocoService } from '@jsverse/transloco';
describe('TasksService', () => {
  let tasksService: TasksService;
  let reportService: jasmine.SpyObj<ReportService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let authService: jasmine.SpyObj<AuthService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let exactCurrencyPipe: jasmine.SpyObj<ExactCurrencyPipe>;
  let expensesService: jasmine.SpyObj<ExpensesService>;
  let employeesService: jasmine.SpyObj<EmployeesService>;
  let spenderReportsService: jasmine.SpyObj<SpenderReportsService>;
  let approverReportsService: jasmine.SpyObj<ApproverReportsService>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let orgService: jasmine.SpyObj<OrgService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let translocoService: jasmine.SpyObj<TranslocoService>;
  const mockTaskClearSubject = new Subject();
  const homeCurrency = 'INR';

  beforeEach(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getReportAutoSubmissionDetails']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats', 'getDuplicateSets']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onTaskCacheClear']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getAdvanceRequestStats']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const exactCurrencyPipeSpy = jasmine.createSpyObj('ExactCurrencyPipe', ['transform']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);
    const employeesServiceSpy = jasmine.createSpyObj('EmployeesService', ['getCommuteDetails']);
    const spenderReportsServiceSpy = jasmine.createSpyObj('SpenderReportsService', ['getReportsStats']);
    const approverReportsServiceSpy = jasmine.createSpyObj('ApproverReportsService', ['getReportsStats']);
    const orgServiceSpy = jasmine.createSpyObj('OrgService', ['getCurrentOrg', 'getPrimaryOrg']);
    const utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['isUserFromINCluster']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    // Mock translate method to return expected strings
    translocoServiceSpy.translate.and.callFake((key: string, params?: any) => {
      const translations: { [key: string]: string } = {
        'services.tasks.expenses': 'Expenses',
        'services.tasks.reports': 'Reports',
        'services.tasks.advances': 'Advances',
        'services.tasks.incomplete': 'Incomplete',
        'services.tasks.complete': 'Complete',
        'services.tasks.duplicate': 'Duplicate',
        'services.tasks.draft': 'Draft',
        'services.tasks.sentBack': 'Sent Back',
        'services.tasks.unapproved': 'Unapproved',
        'services.tasks.updatePhoneNumberHeader': 'Update phone number to opt in to text receipts',
        'services.tasks.optInToTextReceiptsHeader': 'Opt in to text receipts',
        'services.tasks.updatePhoneNumberSubheader':
          'Add a +1 country code to your mobile number to receive text message receipts.',
        'services.tasks.optInToTextReceiptsSubheader':
          'Opt-in to activate text messages for instant expense submission',
        'services.tasks.updateAndOptIn': 'Update and Opt in',
        'services.tasks.optIn': 'Opt in',
        'services.tasks.addCorporateCard': 'Add Corporate Card',
        'services.tasks.addCorporateCardSubheader': 'Add your corporate card to track expenses.',
        'services.tasks.addCard': 'Add Card',
        'services.tasks.potentialDuplicatesHeader': '{count} Potential Duplicates',
        'services.tasks.potentialDuplicatesSubheader': 'We detected {count} expenses which may be duplicates',
        'services.tasks.review': 'Review',
        'services.tasks.worth': 'worth',
        'services.tasks.reportSentBack': 'Report sent back!',
        'services.tasks.reportsSentBack': 'Reports sent back!',
        'services.tasks.sentBackReportSubheader': '{count} report {amount} was sent back by your approver',
        'services.tasks.sentBackReportsSubheader': '{count} reports {amount} were sent back by your approver',
        'services.tasks.viewReport': 'View Report',
        'services.tasks.viewReports': 'View Reports',
        'services.tasks.advanceSentBack': 'Advance sent back!',
        'services.tasks.advancesSentBack': 'Advances sent back!',
        'services.tasks.sentBackAdvanceSubheader': '{count} advance {amount} was sent back by your approver',
        'services.tasks.sentBackAdvancesSubheader': '{count} advances {amount} were sent back by your approver',
        'services.tasks.viewAdvance': 'View Advance',
        'services.tasks.viewAdvances': 'View Advances',
        'services.tasks.unsubmittedReport': 'Unsubmitted report',
        'services.tasks.unsubmittedReports': 'Unsubmitted reports',
        'services.tasks.unsubmittedReportSubheader': '{count} report {amount} remains in draft state',
        'services.tasks.unsubmittedReportsSubheader': '{count} reports {amount} remain in draft state',
        'services.tasks.submitReport': 'Submit Report',
        'services.tasks.submitReports': 'Submit Reports',
        'services.tasks.reportToBeApproved': 'Report to be approved',
        'services.tasks.reportsToBeApproved': 'Reports to be approved',
        'services.tasks.teamReportSubheader': '{count} report {amount} requires your approval',
        'services.tasks.teamReportsSubheader': '{count} reports {amount} require your approval',
        'services.tasks.showReport': 'Show Report',
        'services.tasks.showReports': 'Show Reports',
        'services.tasks.incompleteExpense': 'Incomplete expense',
        'services.tasks.incompleteExpenses': 'Incomplete expenses',
        'services.tasks.draftExpenseSubheader': '{count} expense {amount} require additional information',
        'services.tasks.draftExpensesSubheader': '{count} expenses {amount} require additional information',
        'services.tasks.reviewExpense': 'Review expense',
        'services.tasks.reviewExpenses': 'Review expenses',
        'services.tasks.expensesReadyToReport': 'Expenses are ready to report',
        'services.tasks.unreportedExpenseSubheader': '{count} expense {amount} can be added to a report',
        'services.tasks.unreportedExpensesSubheader': '{count} expenses {amount} can be added to a report',
        'services.tasks.addToReport': 'Add to report',
        'services.tasks.addCommuteDetails': 'Add Commute Details',
        'services.tasks.addCommuteDetailsSubheader':
          'Add your Home and Work locations to easily deduct commute distance from your mileage expenses',
        'services.tasks.add': 'Add',
      };

      let translation = translations[key] || key;

      // Handle parameter interpolation
      if (params) {
        if (params.count) {
          translation = translation.replace('{count}', params.count);
        }
        if (params.amount !== undefined) {
          // For amount parameter, replace with the actual amount or empty string if not provided
          // If amount is provided, it should include a space before it
          const amountValue = params.amount ? ` ${params.amount}` : '';
          translation = translation.replace('{amount}', amountValue);
        }
      }

      return translation;
    });

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: HumanizeCurrencyPipe,
          useValue: humanizeCurrencyPipeSpy,
        },
        {
          provide: ExactCurrencyPipe,
          useValue: exactCurrencyPipeSpy,
        },
        {
          provide: UserEventService,
          useValue: userEventServiceSpy,
        },
        {
          provide: AuthService,
          useValue: authServiceSpy,
        },
        {
          provide: CorporateCreditCardExpenseService,
          useValue: corporateCreditCardExpenseServiceSpy,
        },
        {
          provide: AdvanceRequestService,
          useValue: advanceRequestServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
        {
          provide: EmployeesService,
          useValue: employeesServiceSpy,
        },
        {
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: SpenderReportsService,
          useValue: spenderReportsServiceSpy,
        },
        {
          provide: ApproverReportsService,
          useValue: approverReportsServiceSpy,
        },
        {
          provide: OrgService,
          useValue: orgServiceSpy,
        },
        {
          provide: UtilityService,
          useValue: utilityServiceSpy,
        },
        {
          provide: TranslocoService,
          useValue: translocoServiceSpy,
        },
      ],
    });
    tasksService = TestBed.inject(TasksService);

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    exactCurrencyPipe = TestBed.inject(ExactCurrencyPipe) as jasmine.SpyObj<ExactCurrencyPipe>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
    employeesService = TestBed.inject(EmployeesService) as jasmine.SpyObj<EmployeesService>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    spenderReportsService = TestBed.inject(SpenderReportsService) as jasmine.SpyObj<SpenderReportsService>;
    approverReportsService = TestBed.inject(ApproverReportsService) as jasmine.SpyObj<ApproverReportsService>;
    orgService = TestBed.inject(OrgService) as jasmine.SpyObj<OrgService>;
    utilityService = TestBed.inject(UtilityService) as jasmine.SpyObj<UtilityService>;
    orgSettingsService.get.and.returnValue(of(orgSettingsPendingRestrictions));
    utilityService.isUserFromINCluster.and.resolveTo(false);
    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
  });

  it('should be created', () => {
    expect(tasksService).toBeTruthy();
  });

  it('should be able to fetch tasks related to sent back advances', (done) => {
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    advanceRequestService.getAdvanceRequestStats.and.returnValue(of(sentBackAdvancesResponse));
    exactCurrencyPipe.transform
      .withArgs({ value: sentBackAdvancesResponse.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('123370000.00');
    exactCurrencyPipe.transform
      .withArgs({ value: sentBackAdvancesResponse.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹123370000.00');

    tasksService.getSentBackAdvanceTasks().subscribe((sentBackAdvancesData) => {
      expect(sentBackAdvancesData).toEqual([sentBackAdvanceTaskSample]);
      done();
    });
  });

  it('should be able to fetch unsubmitted reports', (done) => {
    spenderReportsService.getReportsStats.and.returnValue(of(expectedReportStats.draft));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.draft.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('93165.91');
    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.draft.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹93165.91');
    tasksService.getUnsubmittedReportsTasks().subscribe((unsubmittedReportsTasks) => {
      expect(unsubmittedReportsTasks).toEqual([unsubmittedReportTaskSample]);
      done();
    });
  });

  function getUnreportedExpenses() {
    expensesService.getExpenseStats
      .withArgs({
        state: 'in.(COMPLETE)',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
        report_id: 'is.null',
        and: '()',
      })
      .and.returnValue(of(completeStats));

    expensesService.getExpenseStats
      .withArgs({
        state: 'in.(COMPLETE)',
        or: '(policy_amount.is.null,policy_amount.gt.0.0001)',
        report_id: 'is.null',
        and: '(or(matched_corporate_card_transactions.eq.[],matched_corporate_card_transactions->0->status.neq.PENDING))',
      })
      .and.returnValue(of(completeStats));
  }

  it('should be able to fetch unreported expenses tasks', () => {
    getUnreportedExpenses();
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    exactCurrencyPipe.transform
      .withArgs({ value: completeStats.data.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('30.00');
    exactCurrencyPipe.transform
      .withArgs({ value: completeStats.data.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹30.00');
    tasksService.getUnreportedExpensesTasks().subscribe((unrepotedExpensesTasks) => {
      expect(unrepotedExpensesTasks).toEqual([unreportedExpenseTaskSample2]);
    });
  });

  it('should be able to fetch Sent Back Report Tasks', (done) => {
    spenderReportsService.getReportsStats
      .withArgs({
        state: 'eq.APPROVER_INQUIRY',
      })
      .and.returnValue(of(expectedSentBackResponse));

    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    exactCurrencyPipe.transform
      .withArgs({ value: expectedSentBackResponse.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('4500.00');
    exactCurrencyPipe.transform
      .withArgs({ value: expectedSentBackResponse.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹4500.00');

    tasksService.getSentBackReportTasks().subscribe((sentBackReportsTasks) => {
      expect(sentBackReportsTasks).toEqual([sentBackReportTaskSample]);
      done();
    });
  });

  it('should show proper content for singular sent back report', (done) => {
    spenderReportsService.getReportsStats
      .withArgs({
        state: 'eq.APPROVER_INQUIRY',
      })
      .and.returnValue(of(expectedSentBackResponseSingularReport));

    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    exactCurrencyPipe.transform
      .withArgs({ value: expectedSentBackResponse.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('4500.00');
    exactCurrencyPipe.transform
      .withArgs({ value: expectedSentBackResponse.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹4500.00');

    tasksService.getSentBackReportTasks().subscribe((sentBackReportsTasks) => {
      expect(sentBackReportsTasks).toEqual([sentBackReportTaskSingularSample]);
      done();
    });
  });

  it('should be able to fetch team reports tasks is role is APPROVER, and the current org is primary', (done) => {
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.report.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('5177243929.65');
    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.report.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹5177243929.65');

    approverReportsService.getReportsStats
      .withArgs({
        next_approver_user_ids: `cs.[${extendedOrgUserResponse.us.id}]`,
        state: 'eq.APPROVER_PENDING',
      })
      .and.returnValue(of(expectedReportStats.report));

    tasksService.getTeamReportsTasks(true).subscribe((teamReportsTasks) => {
      expect(teamReportsTasks).toEqual([teamReportTaskSample]);
      done();
    });
  });

  it('should be able to return dummy team reports tasks is role is not APPROVER', (done) => {
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponseSpender)));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.report.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('5177243929.65');
    exactCurrencyPipe.transform
      .withArgs({ value: expectedReportStats.report.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹5177243929.65');

    tasksService.getTeamReportsTasks().subscribe((teamReportsTasks) => {
      expect(teamReportsTasks).toEqual([]);
      done();
    });
  });

  it('should be able to fetch potential duplicate tasks', (done) => {
    setupData();
    expensesService.getDuplicateSets.and.returnValue(of(expenseDuplicateSets));
    tasksService.getPotentialDuplicatesTasks().subscribe((potentialDuplicateTasks) => {
      expect(potentialDuplicateTasks).toEqual([potentailDuplicateTaskSample]);
      done();
    });
  });

  it('should be able to fetch incomplete tasks', (done) => {
    expensesService.getExpenseStats
      .withArgs({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      })
      .and.returnValue(of(incompleteStats));

    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    exactCurrencyPipe.transform
      .withArgs({ value: incompleteStats.data.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('76234.47');
    exactCurrencyPipe.transform
      .withArgs({ value: incompleteStats.data.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹76234.47');

    tasksService.getDraftExpensesTasks().subscribe((draftExpensesTasks) => {
      expect(draftExpensesTasks).toEqual([draftExpenseTaskSample2]);
      done();
    });
  });

  it('should be able to fetch total number of tasks pending', (done) => {
    tasksService.totalTaskCount$.next(10);

    tasksService
      .getTotalTaskCount()
      .pipe(take(1))
      .subscribe((taskTotal) => {
        expect(taskTotal).toEqual(10);
        done();
      });
  });

  it('should be able to fetch expensesTaskCount', (done) => {
    tasksService.expensesTaskCount$.next(10);
    tasksService
      .getExpensesTaskCount()
      .pipe(take(1))
      .subscribe((count) => {
        expect(count).toEqual(10);
        done();
      });
  });

  it('should be able to fetch reportsTaskCount', (done) => {
    tasksService.reportsTaskCount$.next(10);
    tasksService
      .getReportsTaskCount()
      .pipe(take(1))
      .subscribe((count) => {
        expect(count).toEqual(10);
        done();
      });
  });

  it('should be able to fetch teamReportsTaskCount', (done) => {
    tasksService.teamReportsTaskCount$.next(10);
    tasksService
      .getTeamReportsTaskCount()
      .pipe(take(1))
      .subscribe((count) => {
        expect(count).toEqual(10);
        done();
      });
  });

  describe('getAddCorporateCardTask(): ', () => {
    it('should return add corporate card task when no cards are enrolled', (done) => {
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([statementUploadedCard]));
      const addCcSpy = spyOn(tasksService, 'mapAddCorporateCardTask');

      tasksService.getAddCorporateCardTask().subscribe((tasks) => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalled();
        expect(tasksService.mapAddCorporateCardTask).toHaveBeenCalled();
        expect(addCcSpy).toHaveBeenCalledOnceWith();
        done();
      });
    });

    it('should return undefined when there are enrolled cards', (done) => {
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard, visaRTFCard]));
      tasksService.getAddCorporateCardTask().subscribe((tasks) => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalled();
        expect(tasks).toEqual([]);
        done();
      });
    });
  });

  it('should be able to fetch advancesTaskCount', (done) => {
    tasksService.advancesTaskCount$.next(10);
    tasksService
      .getAdvancesTaskCount()
      .pipe(take(1))
      .subscribe((count) => {
        expect(count).toEqual(10);
        done();
      });
  });

  it('should be able to generate selected filters', () => {
    const selectedFilters = tasksService.generateSelectedFilters({
      sentBackReports: true,
      draftReports: true,
      draftExpenses: true,
      unreportedExpenses: true,
      potentialDuplicates: true,
      teamReports: true,
      sentBackAdvances: true,
    });

    expect(selectedFilters).toEqual([
      {
        name: 'Expenses',
        value: ['DRAFT', 'UNREPORTED', 'DUPLICATE'],
      },
      {
        name: 'Reports',
        value: ['DRAFT', 'SENT_BACK', 'TEAM'],
      },
      {
        name: 'Advances',
        value: ['SENT_BACK'],
      },
    ]);

    const selectedFilters2 = tasksService.generateSelectedFilters({
      sentBackReports: true,
      draftReports: false,
      draftExpenses: false,
      unreportedExpenses: true,
      potentialDuplicates: false,
      teamReports: false,
      sentBackAdvances: false,
    });

    expect(selectedFilters2).toEqual([
      {
        name: 'Expenses',
        value: ['UNREPORTED'],
      },
      {
        name: 'Reports',
        value: ['SENT_BACK'],
      },
    ]);

    const selectedFilters3 = tasksService.generateSelectedFilters({
      sentBackReports: false,
      draftReports: false,
      draftExpenses: false,
      unreportedExpenses: false,
      potentialDuplicates: true,
      teamReports: true,
      sentBackAdvances: false,
    });

    expect(selectedFilters3).toEqual([
      {
        name: 'Expenses',
        value: ['DUPLICATE'],
      },
      {
        name: 'Reports',
        value: ['TEAM'],
      },
    ]);
  });

  it('should be able to convert selected filters to task filters object', () => {
    const taskFilters = tasksService.convertFilters([
      {
        name: 'Expenses',
        value: ['DRAFT', 'UNREPORTED', 'DUPLICATE'],
      },
      {
        name: 'Reports',
        value: ['DRAFT', 'SENT_BACK', 'TEAM'],
      },
      {
        name: 'Advances',
        value: ['SENT_BACK'],
      },
    ]);

    expect(taskFilters).toEqual({
      sentBackReports: true,
      draftReports: true,
      draftExpenses: true,
      unreportedExpenses: true,
      potentialDuplicates: true,
      teamReports: true,
      sentBackAdvances: true,
    });
  });

  it('should be able to generate expense filter pills', () => {
    expect(
      tasksService.generateFilterPills({
        sentBackReports: true,
        draftReports: true,
        draftExpenses: true,
        unreportedExpenses: true,
        potentialDuplicates: true,
        teamReports: true,
        sentBackAdvances: true,
      })
    ).toEqual([
      {
        label: 'Expenses',
        type: 'Expenses',
        value: 'Incomplete, Complete, Duplicate',
      },
      {
        label: 'Reports',
        type: 'Reports',
        value: 'Draft, Sent Back, Unapproved',
      },
      {
        label: 'Advances',
        type: 'Advances',
        value: 'Sent Back',
      },
    ]);

    expect(
      tasksService.generateFilterPills({
        sentBackReports: true,
        draftReports: false,
        draftExpenses: false,
        unreportedExpenses: true,
        potentialDuplicates: true,
        teamReports: true,
        sentBackAdvances: false,
      })
    ).toEqual([
      {
        label: 'Expenses',
        type: 'Expenses',
        value: 'Complete, Duplicate',
      },
      {
        label: 'Reports',
        type: 'Reports',
        value: 'Sent Back, Unapproved',
      },
    ]);

    expect(
      tasksService.generateFilterPills({
        sentBackReports: false,
        draftReports: false,
        draftExpenses: false,
        unreportedExpenses: false,
        potentialDuplicates: true,
        teamReports: true,
        sentBackAdvances: false,
      })
    ).toEqual([
      {
        label: 'Expenses',
        type: 'Expenses',
        value: 'Duplicate',
      },
      {
        label: 'Reports',
        type: 'Reports',
        value: 'Unapproved',
      },
    ]);
  });

  it('should be able to filter tasks based on filters applied', () => {
    const filteredTaskList = tasksService.getFilteredTaskList(
      {
        sentBackReports: true,
        draftReports: true,
        draftExpenses: true,
        unreportedExpenses: true,
        potentialDuplicates: true,
        teamReports: true,
        sentBackAdvances: true,
      },
      {
        draftExpenses: [draftExpenseTaskSample],
        potentialDuplicates: [potentailDuplicateTaskSample],
        sentBackAdvances: [sentBackAdvanceTaskSample],
        sentBackReports: [sentBackReportTaskSample],
        teamReports: [teamReportTaskSample],
        unreportedExpenses: [unreportedExpenseTaskSample],
        unsubmittedReports: [unsubmittedReportTaskSample],
      }
    );

    expect(filteredTaskList).toEqual([
      potentailDuplicateTaskSample,
      sentBackReportTaskSample,
      draftExpenseTaskSample,
      unsubmittedReportTaskSample,
      unreportedExpenseTaskSample,
      teamReportTaskSample,
      sentBackAdvanceTaskSample,
    ]);

    const filteredTaskList2 = tasksService.getFilteredTaskList(null, {
      draftExpenses: [draftExpenseTaskSample],
      potentialDuplicates: [potentailDuplicateTaskSample],
      sentBackAdvances: [sentBackAdvanceTaskSample],
      sentBackReports: [sentBackReportTaskSample],
      teamReports: [teamReportTaskSample],
      unreportedExpenses: [unreportedExpenseTaskSample],
      unsubmittedReports: [unsubmittedReportTaskSample],
    });

    expect(filteredTaskList2).toEqual([]);
  });

  it('should be able to generate unreported expenses tasks when no reports present', () => {
    const totalCount = incompleteStats.data.count;
    exactCurrencyPipe.transform
      .withArgs({ value: totalCount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('339.00');
    exactCurrencyPipe.transform.withArgs({ value: totalCount, currencyCode: homeCurrency }).and.returnValue('₹339.00');

    const tasks = tasksService.mapAggregateToUnreportedExpensesTask(
      {
        totalCount: 1,
        totalAmount: totalCount,
      },
      homeCurrency
    );
    expect(tasks[0].subheader).toEqual('1 expense  worth ₹339.00  can be added to a report');
  });

  it('should not be generating tasks when no corresponding data is present', () => {
    const tasks = tasksService.mapAggregateToDraftExpensesTask(
      {
        totalAmount: 0,
        totalCount: 0,
      },
      homeCurrency
    );

    expect(tasks).toEqual([]);

    const tasks2 = tasksService.mapAggregateToTeamReportTask(
      {
        total_amount: 0,
        count: 0,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(tasks2).toEqual([]);

    const tasks3 = tasksService.mapAggregateToUnsubmittedReportTask(
      {
        total_amount: 0,
        count: 0,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(tasks3).toEqual([]);

    const tasks4 = tasksService.mapSentBackAdvancesToTasks(
      {
        totalAmount: 0,
        totalCount: 0,
      },
      homeCurrency
    );

    expect(tasks4).toEqual([]);

    const tasks5 = tasksService.mapSentBackReportsToTasks(
      {
        total_amount: 0,
        count: 0,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(tasks5).toEqual([]);

    const tasks6 = tasksService.mapAggregateToUnreportedExpensesTask(
      {
        totalCount: 0,
        totalAmount: 0,
      },
      homeCurrency
    );

    expect(tasks6).toEqual([]);
  });

  it('should not generate unreported expenses tasks when report autosubmission is scheduled', (done) => {
    tasksService.getUnreportedExpensesTasks(true).subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
  });

  it('should not generate unsubmitted reports tasks when report autosubmission is scheduled', (done) => {
    tasksService.getUnsubmittedReportsTasks(true).subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
  });

  it('should be able to handle null response from duplicates sets call', (done) => {
    setupData();
    expensesService.getDuplicateSets.and.returnValue(of(null));
    tasksService.getPotentialDuplicatesTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
  });

  function setupData() {
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    advanceRequestService.getAdvanceRequestStats.and.returnValue(of(sentBackAdvancesResponse));
    spenderReportsService.getReportsStats.and.returnValue(of(expectedReportStats.draft));
    getUnreportedExpenses();
    spenderReportsService.getReportsStats
      .withArgs({
        state: 'eq.APPROVER_INQUIRY',
      })
      .and.returnValue(of(expectedSentBackResponse));
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    orgService.getCurrentOrg.and.returnValue(of(orgData1[0]));
    orgService.getPrimaryOrg.and.returnValue(of(orgData1[0]));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    approverReportsService.getReportsStats
      .withArgs({
        next_approver_user_ids: `cs.[${extendedOrgUserResponse.us.id}]`,
        state: 'eq.APPROVER_PENDING',
      })
      .and.returnValue(of(expectedReportStats.report));
    expensesService.getDuplicateSets.and.returnValue(of(expenseDuplicateSets));
    expensesService.getExpenseStats
      .withArgs({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      })
      .and.returnValue(of(incompleteStats));

    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
    orgSettingsService.get.and.returnValue(of(orgSettingsRes));
    employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
  }

  it('should be able to fetch tasks with no filters', (done) => {
    setupData();
    tasksService.getTasks(false, undefined, true).subscribe((tasks) => {
      expect(tasks.map((task) => task.header)).toEqual([
        '34 Potential Duplicates',
        'Reports sent back!',
        'Incomplete expenses',
        'Unsubmitted reports',
        'Expenses are ready to report',
        'Reports to be approved',
        'Advances sent back!',
      ]);
      done();
    });
  });

  it('should be able to fetch tasks with filters', (done) => {
    setupData();
    tasksService
      .getTasks(false, {
        draftExpenses: false,
        draftReports: false,
        potentialDuplicates: false,
        sentBackAdvances: true,
        sentBackReports: false,
        teamReports: false,
        unreportedExpenses: false,
      })
      .subscribe((tasks) => {
        expect(tasks.map((task) => task.header)).toEqual(['Advances sent back!']);
        done();
      });
  });

  it('should skip unreported expenses & unsubmitted reports when automate report submission is enabled', (done) => {
    setupData();
    tasksService.getTasks(true).subscribe((tasks) => {
      expect(tasks.map((task) => task.header)).toEqual([
        '34 Potential Duplicates',
        'Reports sent back!',
        'Incomplete expenses',
        'Advances sent back!',
      ]);
      done();
    });
  });

  it('should be able to refresh tasks on clearing task cache when automate report submission is scheduled', (done) => {
    const refreshCallback = () => {};
    userEventService.onTaskCacheClear.and.callFake((refreshCallback) =>
      mockTaskClearSubject.subscribe(() => {
        refreshCallback();
      })
    );

    reportService.getReportAutoSubmissionDetails.and.returnValue(
      of({
        data: {
          next_at: new Date(20, 12, 2022),
        },
      })
    );

    setupData();

    tasksService.refreshOnTaskClear();

    mockTaskClearSubject.next(null);

    tasksService.totalTaskCount$
      .pipe(
        filter((count) => count === 5),
        take(1)
      )
      .subscribe((count) => {
        expect(count).toEqual(5);
        done();
      });
  });

  it('should generate proper content in all cases for sent back advances', () => {
    exactCurrencyPipe.transform
      .withArgs({ value: sentBackAdvancesResponse.total_amount, currencyCode: homeCurrency, skipSymbol: true })
      .and.returnValue('123370000.00');
    exactCurrencyPipe.transform
      .withArgs({ value: sentBackAdvancesResponse.total_amount, currencyCode: homeCurrency })
      .and.returnValue('₹123370000.00');

    const sentBackAdvanceTask = tasksService.mapSentBackAdvancesToTasks(
      {
        totalCount: 1,
        totalAmount: sentBackAdvancesResponse.total_amount,
      },
      homeCurrency
    );

    expect(sentBackAdvanceTask).toEqual([
      {
        amount: '123370000.00',
        count: 1,
        header: 'Advance sent back!',
        subheader: '1 advance  worth ₹123370000.00  was sent back by your approver',
        icon: TaskIcon.ADVANCE,
        ctas: [
          {
            content: 'View Advance',
            event: TASKEVENT.openSentBackAdvance,
          },
        ],
      },
    ]);
  });

  it('should generate proper content in all cases for sent back reports', () => {
    exactCurrencyPipe.transform
      .withArgs({
        value: sentBackResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
        skipSymbol: true,
      })
      .and.returnValue('44.53');
    exactCurrencyPipe.transform
      .withArgs({
        value: sentBackResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
      })
      .and.returnValue('₹44.53');

    const sentBackReportTask = tasksService.mapSentBackReportsToTasks(
      {
        count: 2,
        total_amount: sentBackResponse[0].aggregates[1].function_value,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(sentBackReportTask).toEqual([
      {
        amount: '44.53',
        count: 2,
        header: 'Reports sent back!',
        subheader: '2 reports  worth ₹44.53  were sent back by your approver',
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'View Reports',
            event: TASKEVENT.openSentBackReport,
          },
        ],
      },
    ]);
  });

  it('should generate proper content in all cases of draft expenses tasks', () => {
    exactCurrencyPipe.transform
      .withArgs({
        value: incompleteExpensesResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
        skipSymbol: true,
      })
      .and.returnValue('132573333762.37');
    exactCurrencyPipe.transform
      .withArgs({ value: incompleteExpensesResponse[0].aggregates[1].function_value, currencyCode: homeCurrency })
      .and.returnValue('₹132573333762.37');

    const tasks = tasksService.mapAggregateToDraftExpensesTask(
      {
        totalCount: 1,
        totalAmount: incompleteExpensesResponse[0].aggregates[1].function_value,
      },
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '132573333762.37',
        count: 1,
        header: 'Incomplete expense',
        subheader: '1 expense  worth ₹132573333762.37  require additional information',
        icon: TaskIcon.WARNING,
        ctas: [
          {
            content: 'Review expense',
            event: TASKEVENT.reviewExpenses,
          },
        ],
      },
    ]);
  });

  it('should generate proper content in all cases of unsubmitted report tasks', () => {
    exactCurrencyPipe.transform
      .withArgs({
        value: unsubmittedReportsResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
        skipSymbol: true,
      })
      .and.returnValue('0.00');

    const tasks = tasksService.mapAggregateToUnsubmittedReportTask(
      {
        total_amount: unsubmittedReportsResponse[0].aggregates[1].function_value,
        count: 1,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '0.00',
        count: 1,
        header: 'Unsubmitted report',
        subheader: '1 report  remains in draft state',
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Submit Report',
            event: TASKEVENT.openDraftReports,
          },
        ],
      },
    ]);
  });

  it('should be able to generate proper content in all cases of team report tasks', () => {
    exactCurrencyPipe.transform
      .withArgs({
        value: teamReportResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
        skipSymbol: true,
      })
      .and.returnValue('733479.83');
    exactCurrencyPipe.transform
      .withArgs({
        value: teamReportResponse[0].aggregates[1].function_value,
        currencyCode: homeCurrency,
      })
      .and.returnValue('₹733479.83');

    const tasks = tasksService.mapAggregateToTeamReportTask(
      {
        total_amount: teamReportResponse[0].aggregates[1].function_value,
        count: 1,
      } as PlatformReportsStatsResponse,
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '733479.83',
        count: 1,
        header: 'Report to be approved',
        subheader: '1 report  worth ₹733479.83  requires your approval',
        icon: TaskIcon.REPORT,
        ctas: [
          {
            content: 'Show Report',
            event: TASKEVENT.openTeamReport,
          },
        ],
      },
    ]);
  });

  it('should be able to refresh tasks on clearing task cache when automate report submission is not scheduled', (done) => {
    userEventService.onTaskCacheClear.and.callFake((refreshCallback) =>
      mockTaskClearSubject.subscribe(() => {
        refreshCallback();
      })
    );

    reportService.getReportAutoSubmissionDetails.and.returnValue(of(null));

    setupData();

    tasksService.refreshOnTaskClear();

    mockTaskClearSubject.next(null);

    tasksService.totalTaskCount$
      .pipe(
        filter((count) => count === 7),
        take(1)
      )
      .subscribe((count) => {
        expect(count).toEqual(7);
        done();
      });
  });

  describe('mapMobileNumberVerificationTask(): ', () => {
    it('should return correct task object with CTA as Opt in if user not opted in', () => {
      expect(tasksService.mapMobileNumberVerificationTask(false)).toEqual([verifyMobileNumberTask]);
    });

    it('should return correct task object with CTA as Update and Opt in if user added non +1 mobile number', () => {
      expect(tasksService.mapMobileNumberVerificationTask(true)).toEqual([verifyMobileNumberTask2]);
    });
  });

  describe('getMobileNumberVerificationTasks(): ', () => {
    it('should not return any task if user has verified mobile number', (done) => {
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask');
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(res).toEqual([]);
        expect(mapMobileNumberVerificationTaskSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not return any task if user is from IN cluster', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      authService.getEou.and.resolveTo(eou);
      utilityService.isUserFromINCluster.and.resolveTo(true);
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask');
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(utilityService.isUserFromINCluster).toHaveBeenCalledOnceWith();
        expect(res).toEqual([]);
        expect(mapMobileNumberVerificationTaskSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return opt in task if user has not added mobile number and currency is CAD', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      eou.ou.mobile = null;
      eou.org.currency = 'CAD';
      authService.getEou.and.resolveTo(eou);
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask').and.returnValue(
        [addMobileNumberTask]
      );
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(mapMobileNumberVerificationTaskSpy).toHaveBeenCalledTimes(1);
        expect(res).toEqual([addMobileNumberTask]);
        done();
      });
    });

    it('should return opt in task if user has not verified mobile number', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      eou.org.currency = 'USD';
      authService.getEou.and.resolveTo(eou);
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask').and.returnValue(
        [addMobileNumberTask]
      );
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(mapMobileNumberVerificationTaskSpy).toHaveBeenCalledTimes(1);
        expect(res).toEqual([addMobileNumberTask]);
        done();
      });
    });
  });

  describe('getCommuteDetailsTasks():', () => {
    it('should return commute details task if commute details response data is not defined', (done) => {
      employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData2));
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsWithCommuteDeductionsEnabled));

      tasksService.getCommuteDetailsTasks().subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(extendedOrgUserResponse);
        expect(res).toEqual([commuteDeductionTask]);
        done();
      });
    });

    it('should return commute details task if home location is not present', (done) => {
      employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData3));
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsWithCommuteDeductionsEnabled));

      tasksService.getCommuteDetailsTasks().subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(extendedOrgUserResponse);
        expect(res).toEqual([commuteDeductionTask]);
        done();
      });
    });

    it('should not return commute details task if mileage is disabled for org', (done) => {
      employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData3));
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsWoMileage));

      tasksService.getCommuteDetailsTasks().subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(extendedOrgUserResponse);
        expect(res).toEqual([]);
        done();
      });
    });

    it('should not return commute details task if commute deduction settings is disabled for org', (done) => {
      employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData3));
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsRes));

      tasksService.getCommuteDetailsTasks().subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(extendedOrgUserResponse);
        expect(res).toEqual([]);
        done();
      });
    });

    it('should not return commute details task if home location is present in commute details', (done) => {
      employeesService.getCommuteDetails.and.returnValue(of(commuteDetailsResponseData));
      authService.getEou.and.resolveTo(extendedOrgUserResponse);
      orgSettingsService.get.and.returnValue(of(orgSettingsWithCommuteDeductionsDisabled));

      tasksService.getCommuteDetailsTasks().subscribe((res) => {
        expect(orgSettingsService.get).toHaveBeenCalledTimes(1);
        expect(authService.getEou).toHaveBeenCalledTimes(1);
        expect(employeesService.getCommuteDetails).toHaveBeenCalledOnceWith(extendedOrgUserResponse);
        expect(res).toEqual([]);
        done();
      });
    });
  });
});
