import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TitleCasePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { projectNameNullField, transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import {
  allTeamAdvanceRequestsRes,
  singleExtendedAdvReqRes,
} from 'src/app/core/mock-data/extended-advance-request.data';
import { allFilterPills, expectedFilterPill1, expectedFilterPill2 } from 'src/app/core/mock-data/filter-pills.data';
import { draftSentBackFiltersData } from 'src/app/core/mock-data/my-advances-filters.data';
import { AdvancesStates } from 'src/app/core/models/advances-states.model';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { FiltersHelperService } from 'src/app/core/services/filters-helper.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { TeamAdvancePage } from './team-advance.page';

fdescribe('TeamAdvancePage', () => {
  let component: TeamAdvancePage;
  let fixture: ComponentFixture<TeamAdvancePage>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;
  let tasksService: jasmine.SpyObj<TasksService>;
  let trackingService: jasmine.SpyObj<TrackingService>;
  let router: jasmine.SpyObj<Router>;
  let filtersHelperService: jasmine.SpyObj<FiltersHelperService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;

  beforeEach(waitForAsync(() => {
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', [
      'getTeamAdvanceRequests',
      'getTeamAdvanceRequestsCount',
      'destroyAdvanceRequestsCacheBuster',
    ]);
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTotalTaskCount']);
    const trackingServiceSpy = jasmine.createSpyObj('TrackingService', ['footerHomeTabClicked', 'tasksPageOpened']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const filtersHelperServiceSpy = jasmine.createSpyObj('FiltersHelperService', [
      'openFilterModal',
      'generateFilterPills',
    ]);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);

    TestBed.configureTestingModule({
      declarations: [TeamAdvancePage],
      imports: [IonicModule.forRoot()],
      providers: [
        ChangeDetectorRef,
        TitleCasePipe,
        {
          provide: AdvanceRequestService,
          useValue: advanceRequestServiceSpy,
        },
        {
          provide: TasksService,
          useValue: tasksServiceSpy,
        },
        {
          provide: TrackingService,
          useValue: trackingServiceSpy,
        },
        {
          provide: Router,
          useValue: routerSpy,
        },
        {
          provide: FiltersHelperService,
          useValue: filtersHelperServiceSpy,
        },
        {
          provide: ExpenseFieldsService,
          useValue: expenseFieldsServiceSpy,
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TeamAdvancePage);
    component = fixture.componentInstance;

    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    filtersHelperService = TestBed.inject(FiltersHelperService) as jasmine.SpyObj<FiltersHelperService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;

    component.loadData$ = new Subject();
    component.filters = {};

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ionViewWillEnter(): should setup class observables', fakeAsync(() => {
    tasksService.getTotalTaskCount.and.returnValue(of(1));
    spyOn(component, 'setupDefaultFilters');
    advanceRequestService.getTeamAdvanceRequests.and.returnValue(of(allTeamAdvanceRequestsRes));
    spyOn(component, 'getExtraParams').and.returnValue({
      areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
    });
    advanceRequestService.getTeamAdvanceRequestsCount.and.returnValue(of(1));
    spyOn(component, 'getAndUpdateProjectName');

    component.filters = {};

    fixture.detectChanges();

    component.ionViewWillEnter();

    component.teamAdvancerequests$.subscribe((res) => {
      expect(res).toEqual(allTeamAdvanceRequestsRes.data);
    });

    component.isInfiniteScrollRequired$.subscribe((res) => {
      expect(res).toBeFalse();
    });

    component.count$.subscribe((res) => {
      expect(res).toEqual(1);
    });
    tick(1000);
  }));

  describe('changeState(): ', () => {
    it('should change state', () => {
      const mockReInfiniteScrollEvent = {
        target: jasmine.createSpyObj('target', ['complete']),
      };
      spyOn(component.loadData$, 'next');
      advanceRequestService.destroyAdvanceRequestsCacheBuster.and.returnValue(of(null));

      component.changeState(mockReInfiniteScrollEvent);

      expect(advanceRequestService.destroyAdvanceRequestsCacheBuster).toHaveBeenCalledTimes(1);
      expect(component.loadData$.next).toHaveBeenCalledOnceWith({
        pageNumber: component.currentPageNumber,
        state: [],
        sortParam: component.filters.sortParam,
        sortDir: component.filters.sortDir,
      });
    });

    it('should change state and increment page number', () => {
      const mockReInfiniteScrollEvent = {
        target: jasmine.createSpyObj('target', ['complete']),
      };
      spyOn(component.loadData$, 'next');
      advanceRequestService.destroyAdvanceRequestsCacheBuster.and.returnValue(of(null));

      component.changeState(mockReInfiniteScrollEvent, true);
      expect(component.loadData$.next).toHaveBeenCalledOnceWith({
        pageNumber: component.currentPageNumber,
        state: [],
        sortParam: component.filters.sortParam,
        sortDir: component.filters.sortDir,
      });
    });
  });

  it('onAdvanceClick(): should take user to the view advance page', () => {
    component.onAdvanceClick(singleExtendedAdvReqRes.data[0]);

    expect(router.navigate).toHaveBeenCalledOnceWith([
      '/',
      'enterprise',
      'view_team_advance',
      { id: singleExtendedAdvReqRes.data[0].areq_id },
    ]);
  });

  describe('getAndUpdateProjectName():', () => {
    it('should get and update project name', () => {
      expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));

      component.getAndUpdateProjectName();

      expect(component.projectFieldName).toEqual('Purpose');
      expect(expenseFieldsService.getAllEnabled).toHaveBeenCalledTimes(1);
    });
  });

  it('openFilters(): should open filters', fakeAsync(() => {
    filtersHelperService.openFilterModal.and.resolveTo(draftSentBackFiltersData);
    filtersHelperService.generateFilterPills.and.returnValue(allFilterPills);
    spyOn(component, 'changeState');

    component.openFilters();
    tick(500);

    expect(component.changeState).toHaveBeenCalledTimes(1);
    expect(filtersHelperService.openFilterModal).toHaveBeenCalledTimes(1);
    expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(
      component.filters,
      component.projectFieldName
    );
  }));

  describe('onFilterClose():', () => {
    it('should close filters and clear sort filters on closing', () => {
      filtersHelperService.generateFilterPills.and.returnValue(expectedFilterPill2);
      spyOn(component, 'changeState');

      component.onFilterClose('sort');

      expect(component.filters).toEqual({
        sortParam: null,
        sortDir: null,
      });
      expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filters);
      expect(component.changeState).toHaveBeenCalledTimes(1);
    });

    it('should close filters and clear state filters on closing', () => {
      filtersHelperService.generateFilterPills.and.returnValue(expectedFilterPill2);
      spyOn(component, 'changeState');

      component.onFilterClose('state');

      expect(component.filters).toEqual({
        state: null,
      });
      expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith(component.filters);
      expect(component.changeState).toHaveBeenCalledTimes(1);
    });
  });

  it('onFilterClick(): should open filters', fakeAsync(() => {
    spyOn(component, 'openFilters');

    component.onFilterClick('state');
    tick(500);

    expect(component.openFilters).toHaveBeenCalledOnceWith('State');
  }));

  it('onFilterPillsClearAll(): should clear all filters', () => {
    filtersHelperService.generateFilterPills.and.returnValue(null);
    spyOn(component, 'changeState');

    component.onFilterPillsClearAll();
    expect(component.filters).toEqual({});
    expect(component.filterPills).toBeNull();
    expect(component.changeState).toHaveBeenCalledTimes(1);
  });

  it('setupDefaultFilters(): should set default filters automatically', () => {
    filtersHelperService.generateFilterPills.and.returnValue(expectedFilterPill1);

    component.setupDefaultFilters();

    expect(filtersHelperService.generateFilterPills).toHaveBeenCalledOnceWith({
      state: [AdvancesStates.pending],
    });
    expect(component.filters).toEqual({
      state: [AdvancesStates.pending],
    });
    expect(component.filterPills).toEqual(expectedFilterPill1);
  });

  describe('getExtraParams():', () => {
    it('should generate params for both pending and approved states', () => {
      const result = component.getExtraParams([AdvancesStates.pending, AdvancesStates.approved]);

      expect(result).toEqual({
        areq_state: ['not.eq.DRAFT'],
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
      });
    });

    it('should generate params for pending state', () => {
      const result = component.getExtraParams([AdvancesStates.pending]);

      expect(result).toEqual({
        areq_state: ['eq.APPROVAL_PENDING'],
        or: ['(areq_is_sent_back.is.null,areq_is_sent_back.is.false)'],
      });
    });

    it('should generate params for approved state', () => {
      const result = component.getExtraParams([AdvancesStates.approved]);

      expect(result).toEqual({
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE}'],
      });
    });

    it('should generate params for other states', () => {
      const result = component.getExtraParams([AdvancesStates.rejected]);

      expect(result).toEqual({
        areq_approval_state: ['ov.{APPROVAL_PENDING,APPROVAL_DONE,APPROVAL_REJECTED}'],
      });
    });
  });

  it('onHomeClicked(): should take user to dashboard page', () => {
    component.onHomeClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'home' },
    });
    expect(trackingService.footerHomeTabClicked).toHaveBeenCalledOnceWith({
      page: 'Team Advances',
    });
  });

  it('onTaskClicked(): should take the user to dashboard and show tasks', () => {
    component.onTaskClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'my_dashboard'], {
      queryParams: { state: 'tasks', tasksFilters: 'none' },
    });
    expect(trackingService.tasksPageOpened).toHaveBeenCalledOnceWith({
      Asset: 'Mobile',
      from: 'Team Advances',
    });
  });

  it('onCameraClicked(): should open camera', () => {
    component.onCameraClicked();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/', 'enterprise', 'camera_overlay', { navigate_back: true }]);
  });
});
