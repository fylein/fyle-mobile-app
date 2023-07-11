import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { TeamReportsPage } from './team-reports.page';
import { NetworkService } from 'src/app/core/services/network.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ReportService } from 'src/app/core/services/report.service';
import { DateService } from 'src/app/core/services/date.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { ApiV2Service } from 'src/app/core/services/api-v2.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { OrgSettingsService } from 'src/app/core/services/org-settings.service';
import { HeaderState } from 'src/app/shared/components/fy-header/header-state.enum';
import { getElementRef } from 'src/app/core/dom-helpers';
import { cloneDeep } from 'lodash';
import { filter14 } from 'src/app/core/mock-data/my-reports-filters.data';
import { BehaviorSubject } from 'rxjs';

export function TestCases3(getTestBed) {
  return describe('test cases set 3', () => {
    let component: TeamReportsPage;
    let fixture: ComponentFixture<TeamReportsPage>;
    let networkService: jasmine.SpyObj<NetworkService>;
    let loaderService: jasmine.SpyObj<LoaderService>;
    let reportService: jasmine.SpyObj<ReportService>;
    let modalController: jasmine.SpyObj<ModalController>;
    let dateService: jasmine.SpyObj<DateService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
    let currencyService: jasmine.SpyObj<CurrencyService>;
    let popupService: jasmine.SpyObj<PopupService>;
    let trackingService: jasmine.SpyObj<TrackingService>;
    let apiV2Service: jasmine.SpyObj<ApiV2Service>;
    let tasksService: jasmine.SpyObj<TasksService>;
    let orgSettingsService: jasmine.SpyObj<OrgSettingsService>;
    let inputElement: HTMLInputElement;

    beforeEach(waitForAsync(() => {
      const TestBed = getTestBed();
      fixture = TestBed.createComponent(TeamReportsPage);
      component = fixture.componentInstance;
      networkService = TestBed.inject(NetworkService) as jasmine.SpyObj<NetworkService>;
      loaderService = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
      reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
      modalController = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
      dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
      popupService = TestBed.inject(PopupService) as jasmine.SpyObj<PopupService>;
      trackingService = TestBed.inject(TrackingService) as jasmine.SpyObj<TrackingService>;
      activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
      apiV2Service = TestBed.inject(ApiV2Service) as jasmine.SpyObj<ApiV2Service>;
      tasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
      orgSettingsService = TestBed.inject(OrgSettingsService) as jasmine.SpyObj<OrgSettingsService>;
    }));

    it('onSimpleSearchCancel(): should set the header state to base and call clearText with "onSimpleSearchCancel"', () => {
      spyOn(component, 'clearText');

      component.onSimpleSearchCancel();

      expect(component.headerState).toEqual(HeaderState.base);
      expect(component.clearText).toHaveBeenCalledWith('onSimpleSearchCancel');
    });

    it('onSearchBarFocus(): should set isSearchBarFocused to true', () => {
      component.simpleSearchInput = getElementRef(fixture, '.reports--simple-search-input');
      inputElement = component.simpleSearchInput.nativeElement;
      component.isSearchBarFocused = false;

      inputElement.dispatchEvent(new Event('focus'));

      expect(component.isSearchBarFocused).toEqual(true);
    });

    it('onFilterPillsClearAll(): should call clearFilters', () => {
      spyOn(component, 'clearFilters');

      component.onFilterPillsClearAll();

      expect(component.clearFilters).toHaveBeenCalledTimes(1);
    });

    describe('onFilterClick(): ', () => {
      beforeEach(() => {
        spyOn(component, 'openFilters');
      });
      it('should call openFilters with State if filterType is state', () => {
        component.onFilterClick('state');

        expect(component.openFilters).toHaveBeenCalledOnceWith('State');
      });

      it('should call openFilters with Date if filterType is date', () => {
        component.onFilterClick('date');

        expect(component.openFilters).toHaveBeenCalledOnceWith('Submitted Date');
      });

      it('should call openFilters with Date if filterType is date', () => {
        component.onFilterClick('sort');

        expect(component.openFilters).toHaveBeenCalledOnceWith('Sort By');
      });
    });
  });
}
