import { TestBed } from '@angular/core/testing';
import { cloneDeep } from 'lodash';
import { of, Subject, take } from 'rxjs';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
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

import { TasksService } from './tasks.service';
import { TransactionService } from './transaction.service';
import { UserEventService } from './user-event.service';

fdescribe('TasksService', () => {
  let tasksService: TasksService;
  let reportService: jasmine.SpyObj<ReportService>;
  let transactionService: jasmine.SpyObj<TransactionService>;
  let userEventService: jasmine.SpyObj<UserEventService>;
  let authService: jasmine.SpyObj<AuthService>;
  let handleDuplicatesService: jasmine.SpyObj<HandleDuplicatesService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;

  const mockTaskClearSubject = new Subject();
  const homeCurrency = 'INR';

  const draftExpenseTaskSample = {
    amount: '132.57B',
    count: 161,
    header: 'Incomplete expenses',
    subheader: '161 expenses worth ₹132.57B  require additional information',
    icon: TaskIcon.WARNING,
    ctas: [
      {
        content: 'Review Expenses',
        event: 3,
      },
    ],
  };

  const potentailDuplicateTaskSample = {
    hideAmount: true,
    count: 13,
    header: '34 Potential Duplicates',
    subheader: 'We detected 34 expenses which may be duplicates',
    icon: TaskIcon.WARNING,
    ctas: [
      {
        content: 'Review',
        event: 6,
      },
    ],
  };

  const teamReportTaskSample = {
    amount: '733.48K',
    count: 2,
    header: 'Reports to be approved',
    subheader: '2 reports worth ₹733.48K  require your approval',
    icon: TaskIcon.REPORT,
    ctas: [
      {
        content: 'Show Reports',
        event: 5,
      },
    ],
  };

  const sentBackReportTaskSample = {
    amount: '44.53',
    count: 1,
    header: 'Report sent back!',
    subheader: '1 report worth ₹44.53  was sent back by your approver',
    icon: TaskIcon.REPORT,
    ctas: [
      {
        content: 'View Report',
        event: 2,
      },
    ],
  };

  const unreportedExpenseTaskSample = {
    amount: '142.26K',
    count: 13,
    header: 'Unreported',
    subheader: '13 expenses  worth ₹142.26K  can be added to a report',
    icon: TaskIcon.REPORT,
    ctas: [
      {
        content: 'Create New Report',
        event: 0,
      },
      {
        content: 'Add to Existing Report',
        event: 1,
      },
    ],
  };

  const unsubmittedReportTaskSample = {
    amount: '0.00',
    count: 2,
    header: 'Unsubmitted reports',
    subheader: '2 reports remain in draft state',
    icon: TaskIcon.REPORT,
    ctas: [
      {
        content: 'Submit Reports',
        event: 4,
      },
    ],
  };

  const sentBackAdvanceTaskSample = {
    amount: '123.37M',
    count: 5,
    header: 'Advances sent back!',
    subheader: '5 advances worth ₹123.37M  were sent back by your approver',
    icon: TaskIcon.ADVANCE,
    ctas: [
      {
        content: 'View Advances',
        event: 7,
      },
    ],
  };

  beforeEach(() => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', [
      'getReportAutoSubmissionDetails',
      'getReportStatsData',
      'getAllExtendedReports',
    ]);
    const transactionServiceSpy = jasmine.createSpyObj('TransactionService', ['getTransactionStats']);
    const userEventServiceSpy = jasmine.createSpyObj('UserEventService', ['onTaskCacheClear']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getEou']);
    const handleDuplicatesServiceSpy = jasmine.createSpyObj('HandleDuplicatesService', ['getDuplicateSets']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getMyAdvanceRequestStats']);
    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getHomeCurrency']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);

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
          provide: AdvanceRequestService,
          useValue: advanceRequestServiceSpy,
        },
        {
          provide: CurrencyService,
          useValue: currencyServiceSpy,
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
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
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
    transactionService.getTransactionStats
      .withArgs('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(COMPLETE)',
        or: '(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001)',
        tx_report_id: 'is.null',
      })
      .and.returnValue(of(unreportedExpensesResponse));

    reportService.getAllExtendedReports.and.returnValue(of(allExtendedReportsResponse));
  }

  it('should be able to fetch unreported expenses tasks', () => {
    getUnreportedExpenses();
    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));
    humanizeCurrencyPipe.transform
      .withArgs(unreportedExpensesResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('142.26K');
    humanizeCurrencyPipe.transform
      .withArgs(unreportedExpensesResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹142.26K');
    tasksService.getUnreportedExpensesTasks().subscribe((unrepotedExpensesTasks) => {
      expect(unrepotedExpensesTasks).toEqual([unreportedExpenseTaskSample]);
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
    handleDuplicatesService.getDuplicateSets.and.returnValue(of(potentialDuplicatesApiResponse));
    tasksService.getPotentialDuplicatesTasks().subscribe((potentialDuplicateTasks) => {
      expect(potentialDuplicateTasks).toEqual([potentailDuplicateTaskSample]);
      done();
    });
  });

  it('should be able to fetch incomplete tasks', (done) => {
    transactionService.getTransactionStats
      .withArgs('count(tx_id),sum(tx_amount)', {
        scalar: true,
        tx_state: 'in.(DRAFT)',
        tx_report_id: 'is.null',
      })
      .and.returnValue(of(incompleteExpensesResponse));

    currencyService.getHomeCurrency.and.returnValue(of(homeCurrency));

    humanizeCurrencyPipe.transform
      .withArgs(incompleteExpensesResponse[0].aggregates[1].function_value, homeCurrency, true)
      .and.returnValue('132.57B');
    humanizeCurrencyPipe.transform
      .withArgs(incompleteExpensesResponse[0].aggregates[1].function_value, homeCurrency)
      .and.returnValue('₹132.57B');

    tasksService.getDraftExpensesTasks().subscribe((draftExpensesTasks) => {
      expect(draftExpensesTasks).toEqual([draftExpenseTaskSample]);
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
        value: 'Incomplete, Unreported, Duplicate',
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
        value: 'Unreported, Duplicate',
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
    const totalCount = unreportedExpensesResponse[0].aggregates[1].function_value;
    humanizeCurrencyPipe.transform.withArgs(totalCount, homeCurrency, true).and.returnValue('142.26K');
    humanizeCurrencyPipe.transform.withArgs(totalCount, homeCurrency).and.returnValue('₹142.26K');

    const tasks = tasksService.mapAggregateToUnreportedExpensesTask(
      {
        totalCount: 1,
        totalAmount: totalCount,
      },
      'INR',
      []
    );
    expect(tasks[0].subheader).toEqual('1 expense  worth ₹142.26K  can be added to a report');
  });

  it('should make sure that stats dont fail even if aggregates are not present in response', () => {
    const mappedStatsReponse = tasksService.getStatsFromResponse([], 'count(rp_id)', 'sum(rp_amount)');
    expect(mappedStatsReponse).toEqual({
      totalCount: 0,
      totalAmount: 0,
    });
  });

  // it('should be able to refresh tasks on clearing task cache', () => {
  //   userEventService.onTaskCacheClear.and.callFake((refreshCallback) => {
  //     return mockTaskClearSubject.subscribe(() => {
  //       refreshCallback();
  //     });
  //   });

  //   setupDefaultResponses();

  //   tasksService.refreshOnTaskClear();

  //   mockTaskClearSubject.next(null);

  //   reportService.getReportAutoSubmissionDetails.and.returnValue(of({
  //     data: {
  //       next_at: new Date(20,12,2022)
  //     }
  //   }));
  // });
});
