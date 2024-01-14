import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { filter, of, reduce, Subject, switchMap, take } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { TASKEVENT } from '../models/task-event.enum';
import { TaskIcon } from '../models/task-icon.enum';
import {
  allExtendedReportsResponse,
  extendedOrgUserResponse,
  incompleteExpensesResponse,
  potentialDuplicatesApiResponse,
  sentBackAdvancesResponse,
  sentBackResponse,
  teamReportResponse,
  unreportedExpensesResponse,
  unsubmittedReportsResponse,
} from '../test-data/tasks.service.spec.data';
import { AdvanceRequestService } from './advance-request.service';
import { AuthService } from './auth.service';
import { CurrencyService } from './currency.service';
import { HandleDuplicatesService } from './handle-duplicates.service';
import { ReportService } from './report.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';

import { TasksService } from './tasks.service';
import { TransactionService } from './transaction.service';
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
} from '../mock-data/task.data';
import { mastercardRTFCard } from '../mock-data/platform-corporate-card.data';
import { OrgSettingsService } from './org-settings.service';
import { ExpensesService } from './platform/v1/spender/expenses.service';
import { orgSettingsWithDuplicateDetectionV2, orgSettingsWoDuplicateDetectionV2 } from '../mock-data/org-settings.data';
import { expenseDuplicateSets } from '../mock-data/platform/v1/expense-duplicate-sets.data';
import { completeStats, incompleteStats } from '../mock-data/platform/v1/expenses-stats.data';

describe('TasksService', () => {
  let tasksService: TasksService;
  let reportService: jasmine.SpyObj<ReportService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let authService: jasmine.SpyObj<AuthService>;
  let handleDuplicatesService: jasmine.SpyObj<HandleDuplicatesService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
  let expensesService: jasmine.SpyObj<ExpensesService>;

  const mockTaskClearSubject = new Subject();
  const homeCurrency = 'INR';

  beforeEach(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReportAutoSubmissionDetails',
      'getReportStatsData',
      'getAllExtendedReports',
    ]);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const expensesServiceSpy = jasmine.createSpyObj('ExpensesService', ['getExpenseStats', 'getDuplicateSets']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onTaskCacheClear']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const handleDuplicatesServiceSpy = jasmine.createSpyObj('HandleDuplicatesService', ['getDuplicateSets']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getMyAdvanceRequestStats']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getCorporateCards',
    ]);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const orgSettingsServiceSpy = jasmine.createSpyObj('OrgSettingsService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        TasksService,
        {
          provide: ReportService,
          useValue: reportServiceSpy,
        },
        {
          provide: TransactionService,
          useValue: transactionServiceSpy,
        },
        {
          provide: HumanizeCurrencyPipe,
          useValue: humanizeCurrencyPipeSpy,
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
          provide: HandleDuplicatesService,
          useValue: handleDuplicatesServiceSpy,
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
          provide: OrgSettingsService,
          useValue: orgSettingsServiceSpy,
        },
        {
          provide: ExpensesService,
          useValue: expensesServiceSpy,
        },
      ],
    });
    tasksService = TestBed.inject(TasksService);

    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    transactionService = TestBed.inject(TransactionService) as jasmine.SpyObj<TransactionService>;
    userEventService = TestBed.inject(UserEventService) as jasmine.SpyObj<UserEventService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    handleDuplicatesService = TestBed.inject(HandleDuplicatesService) as jasmine.SpyObj<HandleDuplicatesService>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    expensesService = TestBed.inject(ExpensesService) as jasmine.SpyObj<ExpensesService>;
  });

  it('should be created', () => {
    expect(tasksService).toBeTruthy();
  });

  it('should be able to fetch tasks related to sent back advances', (done) => {
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    advanceRequestService.getMyAdvanceRequestStats.and.returnValue(of(sentBackAdvancesResponse));
    humanizeCurrencyPipe.transform
      .withArgs(sentBackAdvancesResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('123.37M');
    humanizeCurrencyPipe.transform
      .withArgs(sentBackAdvancesResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹123.37M');

    tasksService.getSentBackAdvanceTasks().subscribe((sentBackAdvancesData) => {
      expect(sentBackAdvancesData).toEqual([sentBackAdvanceTaskSample]);
      done();
    });
  });

  function setupUnsibmittedReportsResponse() {
    reportService.getReportStatsData
      .withArgs({
        scalar: true,
        aggregates: 'count(rp_id),sum(rp_amount)',
        rp_state: 'in.(DRAFT)',
      })
      .and.returnValue(of(unsubmittedReportsResponse));
  }

  it('should be able to fetch unsubmitted reports', (done) => {
    setupUnsibmittedReportsResponse();
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    humanizeCurrencyPipe.transform
      .withArgs(unsubmittedReportsResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('0.00');
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
      })
      .and.returnValue(of(completeStats));

    reportService.getAllExtendedReports.and.returnValue(of(allExtendedReportsResponse));
  }

  it('should be able to fetch unreported expenses tasks', () => {
    getUnreportedExpenses();
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    humanizeCurrencyPipe.transform
      .withArgs(completeStats.data.total_amount, homeCurrency, true)
      .and.returnValue('142.26K');
    humanizeCurrencyPipe.transform.withArgs(completeStats.data.total_amount, homeCurrency).and.returnValue('₹142.26K');
    tasksService.getUnreportedExpensesTasks().subscribe((unrepotedExpensesTasks) => {
      expect(unrepotedExpensesTasks).toEqual([unreportedExpenseTaskSample2]);
    });
  });

  it('should be able to fetch Sent Back Report Tasks', (done) => {
    reportService.getReportStatsData
      .withArgs({
        scalar: true,
        aggregates: 'count(rp_id),sum(rp_amount)',
        rp_state: 'in.(APPROVER_INQUIRY)',
      })
      .and.returnValue(of(sentBackResponse));

    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    humanizeCurrencyPipe.transform
      .withArgs(sentBackResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('44.53');
    humanizeCurrencyPipe.transform
      .withArgs(sentBackResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹44.53');

    tasksService.getSentBackReportTasks().subscribe((sentBackReportsTasks) => {
      expect(sentBackReportsTasks).toEqual([sentBackReportTaskSample]);
      done();
    });
  });

  it('should be able to fetch team reports tasks', (done) => {
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    humanizeCurrencyPipe.transform
      .withArgs(teamReportResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('733.48K');
    humanizeCurrencyPipe.transform
      .withArgs(teamReportResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹733.48K');

    reportService.getReportStatsData
      .withArgs(
        {
          approved_by: 'cs.{' + extendedOrgUserResponse.ou.id + '}',
          rp_approval_state: ['in.(APPROVAL_PENDING)'],
          rp_state: ['in.(APPROVER_PENDING)'],
          sequential_approval_turn: ['in.(true)'],
          aggregates: 'count(rp_id),sum(rp_amount)',
          scalar: true,
        },
        false
      )
      .and.returnValue(of(teamReportResponse));

    tasksService.getTeamReportsTasks().subscribe((teamReportsTasks) => {
      expect(teamReportsTasks).toEqual([teamReportTaskSample]);
      done();
    });
  });

  it('should be able to fetch potential duplicate tasks', (done) => {
    setupData();
    handleDuplicatesService.getDuplicateSets.and.returnValue(of(potentialDuplicatesApiResponse));
    tasksService.getPotentialDuplicatesTasks().subscribe((potentialDuplicateTasks) => {
      expect(potentialDuplicateTasks).toEqual([potentailDuplicateTaskSample]);
      done();
    });
  });

  it('should be able to fetch potential duplicate tasks when duplicate detection v2 is enabled', (done) => {
    setupData();
    orgSettingsService.get.and.returnValue(of(orgSettingsWithDuplicateDetectionV2));
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

    humanizeCurrencyPipe.transform
      .withArgs(incompleteStats.data.total_amount, homeCurrency, true)
      .and.returnValue('132.57B');
    humanizeCurrencyPipe.transform
      .withArgs(incompleteStats.data.total_amount, homeCurrency)
      .and.returnValue('₹132.57B');

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
    humanizeCurrencyPipe.transform.withArgs(totalCount, homeCurrency, true).and.returnValue('142.26K');
    humanizeCurrencyPipe.transform.withArgs(totalCount, homeCurrency).and.returnValue('₹142.26K');

    const tasks = tasksService.mapAggregateToUnreportedExpensesTask(
      {
        totalCount: 1,
        totalAmount: totalCount,
      },
      homeCurrency
    );
    expect(tasks[0].subheader).toEqual('1 expense  worth ₹142.26K  can be added to a report');
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
        totalAmount: 0,
        totalCount: 0,
      },
      homeCurrency
    );

    expect(tasks2).toEqual([]);

    const tasks3 = tasksService.mapAggregateToUnsubmittedReportTask(
      {
        totalAmount: 0,
        totalCount: 0,
      },
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
        totalAmount: 0,
        totalCount: 0,
      },
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

  it('should be able to handle null reponse from potential duplicates get call', (done) => {
    setupData();
    handleDuplicatesService.getDuplicateSets.and.returnValue(of(null));
    tasksService.getPotentialDuplicatesTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
  });

  it('should be able to handle null response from duplicate detection v2 duplicates sets call', (done) => {
    setupData();
    orgSettingsService.get.and.returnValue(of(orgSettingsWithDuplicateDetectionV2));
    expensesService.getDuplicateSets.and.returnValue(of(null));
    tasksService.getPotentialDuplicatesTasks().subscribe((tasks) => {
      expect(tasks).toEqual([]);
      done();
    });
  });

  function setupData() {
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    advanceRequestService.getMyAdvanceRequestStats.and.returnValue(of(sentBackAdvancesResponse));
    setupUnsibmittedReportsResponse();
    getUnreportedExpenses();
    reportService.getReportStatsData
      .withArgs({
        scalar: true,
        aggregates: 'count(rp_id),sum(rp_amount)',
        rp_state: 'in.(APPROVER_INQUIRY)',
      })
      .and.returnValue(of(sentBackResponse));
    authService.getEou.and.returnValue(new Promise((resolve) => resolve(extendedOrgUserResponse)));
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    reportService.getReportStatsData
      .withArgs(
        {
          approved_by: 'cs.{' + extendedOrgUserResponse.ou.id + '}',
          rp_approval_state: ['in.(APPROVAL_PENDING)'],
          rp_state: ['in.(APPROVER_PENDING)'],
          sequential_approval_turn: ['in.(true)'],
          aggregates: 'count(rp_id),sum(rp_amount)',
          scalar: true,
        },
        false
      )
      .and.returnValue(of(teamReportResponse));
    orgSettingsService.get.and.returnValue(of(orgSettingsWoDuplicateDetectionV2));
    handleDuplicatesService.getDuplicateSets.and.returnValue(of(potentialDuplicatesApiResponse));
    expensesService.getExpenseStats
      .withArgs({
        state: 'in.(DRAFT)',
        report_id: 'is.null',
      })
      .and.returnValue(of(incompleteStats));

    corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
  }

  it('should be able to fetch tasks with no filters', (done) => {
    setupData();
    tasksService.getTasks().subscribe((tasks) => {
      expect(tasks.map((task) => task.header)).toEqual([
        '34 Potential Duplicates',
        'Report sent back!',
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
        'Report sent back!',
        'Incomplete expenses',
        'Reports to be approved',
        'Advances sent back!',
      ]);
      done();
    });
  });

  it('should make sure that stats dont fail even if aggregates are not present in response', () => {
    const mappedStatsReponse = tasksService.getStatsFromResponse([], 'count(rp_id)', 'sum(rp_amount)');
    expect(mappedStatsReponse).toEqual({
      totalCount: 0,
      totalAmount: 0,
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
    humanizeCurrencyPipe.transform
      .withArgs(sentBackAdvancesResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('123.37M');
    humanizeCurrencyPipe.transform
      .withArgs(sentBackAdvancesResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹123.37M');

    const sentBackAdvanceTask = tasksService.mapSentBackAdvancesToTasks(
      {
        totalCount: 1,
        totalAmount: sentBackAdvancesResponse[0].aggregates[1].function_value,
      },
      homeCurrency
    );

    expect(sentBackAdvanceTask).toEqual([
      {
        amount: '123.37M',
        count: 1,
        header: 'Advance sent back!',
        subheader: '1 advance worth ₹123.37M  was sent back by your approver',
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
    humanizeCurrencyPipe.transform
      .withArgs(sentBackResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('44.53');
    humanizeCurrencyPipe.transform
      .withArgs(sentBackResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹44.53');

    const sentBackReportTask = tasksService.mapSentBackReportsToTasks(
      {
        totalCount: 2,
        totalAmount: sentBackResponse[0].aggregates[1].function_value,
      },
      homeCurrency
    );

    expect(sentBackReportTask).toEqual([
      {
        amount: '44.53',
        count: 2,
        header: 'Reports sent back!',
        subheader: '2 reports worth ₹44.53  were sent back by your approver',
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
    humanizeCurrencyPipe.transform
      .withArgs(incompleteExpensesResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('132.57B');
    humanizeCurrencyPipe.transform
      .withArgs(incompleteExpensesResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹132.57B');

    const tasks = tasksService.mapAggregateToDraftExpensesTask(
      {
        totalCount: 1,
        totalAmount: incompleteExpensesResponse[0].aggregates[1].function_value,
      },
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '132.57B',
        count: 1,
        header: 'Incomplete expense',
        subheader: '1 expense worth ₹132.57B  require additional information',
        icon: TaskIcon.WARNING,
        ctas: [
          {
            content: 'Review Expense',
            event: TASKEVENT.reviewExpenses,
          },
        ],
      },
    ]);
  });

  it('should generate proper content in all cases of unsibmitted report tasks', () => {
    humanizeCurrencyPipe.transform
      .withArgs(unsubmittedReportsResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('0.00');

    const tasks = tasksService.mapAggregateToUnsubmittedReportTask(
      {
        totalAmount: unsubmittedReportsResponse[0].aggregates[1].function_value,
        totalCount: 1,
      },
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '0.00',
        count: 1,
        header: 'Unsubmitted report',
        subheader: '1 report remains in draft state',
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
    humanizeCurrencyPipe.transform
      .withArgs(teamReportResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('733.48K');
    humanizeCurrencyPipe.transform
      .withArgs(teamReportResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹733.48K');

    const tasks = tasksService.mapAggregateToTeamReportTask(
      {
        totalAmount: teamReportResponse[0].aggregates[1].function_value,
        totalCount: 1,
      },
      homeCurrency
    );

    expect(tasks).toEqual([
      {
        amount: '733.48K',
        count: 1,
        header: 'Report to be approved',
        subheader: '1 report worth ₹733.48K  requires your approval',
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
    it('should return correct task object for add mobile number', () => {
      expect(tasksService.mapMobileNumberVerificationTask('Add')).toEqual([addMobileNumberTask]);
    });

    it('should return correct task object for verify mobile number', () => {
      expect(tasksService.mapMobileNumberVerificationTask('Verify')).toEqual([verifyMobileNumberTask]);
    });
  });

  describe('getMobileNumberVerificationTasks(): ', () => {
    it('should not return any task if user has verified mobile number', (done) => {
      authService.getEou.and.returnValue(Promise.resolve(extendedOrgUserResponse));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask');
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledOnceWith();
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(res).toEqual([]);
        expect(mapMobileNumberVerificationTaskSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not return any task if user has not enrolled for RTF', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      authService.getEou.and.returnValue(Promise.resolve(eou));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([]));
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask');
      tasksService.getMobileNumberVerificationTasks().subscribe((res) => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledOnceWith();
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(res).toEqual([]);
        expect(mapMobileNumberVerificationTaskSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should return add number task if user has not added mobile number', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      eou.ou.mobile = null;
      authService.getEou.and.returnValue(Promise.resolve(eou));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask').and.returnValue(
        [addMobileNumberTask]
      );
      tasksService.getMobileNumberVerificationTasks().subscribe(() => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledOnceWith();
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(mapMobileNumberVerificationTaskSpy).toHaveBeenCalledOnceWith('Add');
        done();
      });
    });

    it('should return verify number task if user has verified mobile number', (done) => {
      const eou = cloneDeep(extendedOrgUserResponse);
      eou.ou.mobile_verified = false;
      authService.getEou.and.returnValue(Promise.resolve(eou));
      corporateCreditCardExpenseService.getCorporateCards.and.returnValue(of([mastercardRTFCard]));
      const mapMobileNumberVerificationTaskSpy = spyOn(tasksService, 'mapMobileNumberVerificationTask').and.returnValue(
        [addMobileNumberTask]
      );
      tasksService.getMobileNumberVerificationTasks().subscribe(() => {
        expect(corporateCreditCardExpenseService.getCorporateCards).toHaveBeenCalledOnceWith();
        expect(authService.getEou).toHaveBeenCalledOnceWith();
        expect(mapMobileNumberVerificationTaskSpy).toHaveBeenCalledOnceWith('Verify');
        done();
      });
    });
  });
});
