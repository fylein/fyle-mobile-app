import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';

import { MyViewAdvancePage } from './my-view-advance.page';
import { AdvanceService } from 'src/app/core/services/advance.service';
import { ActivatedRoute, Router, UrlSerializer } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { StatisticTypes } from 'src/app/shared/components/fy-statistic/statistic-type.enum';
import { transformedResponse2 } from 'src/app/core/mock-data/expense-field.data';
import { of } from 'rxjs';
import { singleExtendedAdvancesData3 } from 'src/app/core/mock-data/extended-advance.data';
import { AdvanceRequestService } from 'src/app/core/services/advance-request.service';
import { publicAdvanceRequestRes } from 'src/app/core/mock-data/extended-advance-request.data';

describe('MyViewAdvancePage', () => {
  let component: MyViewAdvancePage;
  let fixture: ComponentFixture<MyViewAdvancePage>;
  let advanceService: jasmine.SpyObj<AdvanceService>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let loaderService: jasmine.SpyObj<LoaderService>;
  let expenseFieldsService: jasmine.SpyObj<ExpenseFieldsService>;
  let advanceRequestService: jasmine.SpyObj<AdvanceRequestService>;

  beforeEach(waitForAsync(() => {
    const advanceServiceSpy = jasmine.createSpyObj('AdvanceService', ['getAdvance']);
    const loaderServiceSpy = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    const expenseFieldsServiceSpy = jasmine.createSpyObj('ExpenseFieldsService', ['getAllEnabled']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const navControllerSpy = jasmine.createSpyObj('NavController', ['navigateForward']);
    const advanceRequestServiceSpy = jasmine.createSpyObj('AdvanceRequestService', ['getAdvanceRequestPlatform']);

    TestBed.configureTestingModule({
      declarations: [MyViewAdvancePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AdvanceService, useValue: advanceServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'advETmi3eePvQ',
              },
            },
          },
        },
        { provide: LoaderService, useValue: loaderServiceSpy },
        { provide: ExpenseFieldsService, useValue: expenseFieldsServiceSpy },
        UrlSerializer,
        {
          provide: NavController,
          useValue: navControllerSpy,
        },
        { provide: Router, useValue: routerSpy },
        { provide: AdvanceRequestService, useValue: advanceRequestServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyViewAdvancePage);
    component = fixture.componentInstance;
    advanceService = TestBed.inject(AdvanceService) as jasmine.SpyObj<AdvanceService>;
    advanceRequestService = TestBed.inject(AdvanceRequestService) as jasmine.SpyObj<AdvanceRequestService>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    expenseFieldsService = TestBed.inject(ExpenseFieldsService) as jasmine.SpyObj<ExpenseFieldsService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('StatisticTypes(): should return StatisticTypes', () => {
    expect(component.StatisticTypes).toEqual(StatisticTypes);
  });

  it('getAndUpdateProjectName(): should set project field name equal to field name having column name as project_id', () => {
    expenseFieldsService.getAllEnabled.and.returnValue(of(transformedResponse2));

    component.getAndUpdateProjectName();

    expect(component.projectFieldName).toEqual('Purpose');
  });

  describe('ionViewWillEnter()', () => {
    beforeEach(() => {
      spyOn(component, 'getAndUpdateProjectName');
      advanceService.getAdvance.and.returnValue(of(singleExtendedAdvancesData3));
      advanceRequestService.getAdvanceRequestPlatform.and.returnValue(of(publicAdvanceRequestRes.data[0]));
    });

    it('should set advance$ correctly', fakeAsync(() => {
      component.ionViewWillEnter();
      component.advanceRequest$.subscribe((data) => {
        expect(data).toEqual(publicAdvanceRequestRes.data[0]);
      });
      tick(100);

      expect(advanceService.getAdvance).toHaveBeenCalledOnceWith('advETmi3eePvQ');
      expect(advanceRequestService.getAdvanceRequestPlatform).toHaveBeenCalledOnceWith('areqrttywiidF8');
    }));

    it('should set currencySymbol to ₹ if advance currency is defined', fakeAsync(() => {
      component.ionViewWillEnter();
      tick(100);

      expect(component.currencySymbol).toEqual('₹');
    }));

    it('should set currencySymbol to undefined if advance is undefined', fakeAsync(() => {
      advanceService.getAdvance.and.returnValue(of(undefined));
      component.ionViewWillEnter();
      tick(100);

      expect(component.currencySymbol).toBeUndefined();
    }));
  });
});
