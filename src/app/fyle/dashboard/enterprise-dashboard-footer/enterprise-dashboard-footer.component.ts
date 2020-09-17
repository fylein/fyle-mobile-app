import { Component, OnInit, Input } from '@angular/core';
import { OfflineService } from 'src/app/core/services/offline.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { pipe, forkJoin } from 'rxjs';

@Component({
  selector: 'app-enterprise-dashboard-footer',
  templateUrl: './enterprise-dashboard-footer.component.html',
  styleUrls: ['./enterprise-dashboard-footer.component.scss'],
})
export class EnterpriseDashboardFooterComponent implements OnInit {

  @Input() dashboardList: any[];
  ctaList: any[];
  orgUserSettings: any;
  orgSettings: any;
  canCreateExpense: boolean; // no idea why this variable is used
  gridSize: number;

  constructor(
    private offlineService: OfflineService,
    private dashboardService: DashboardService
  ) { }


  setIconList() {
    //console.log(this.orgUserSettings);
    //console.log(this.orgSettings);
    const isInstaFyleEnabled = this.orgUserSettings ? this.orgUserSettings.insta_fyle_settings.enabled : false;
    const isBulkFyleEnabled = this.orgUserSettings ? this.orgUserSettings.bulk_fyle_settings.enabled : false;
    this.ctaList = [];

    if(this.canCreateExpense) {
      let isPerDiemEnabled = false;
      let isMileageEnabled = false;
      if (this.orgSettings && this.orgSettings.per_diem && this.orgSettings.per_diem.enabled) {
        isPerDiemEnabled = true;
      }

      // Org Settings related
      if (this.orgSettings && this.orgSettings.mileage && this.orgSettings.mileage.enabled) {
        isMileageEnabled = true;
      }

      let buttonList = {
        addPerDiem: {
          name: 'Add Per Diem',
          icon: 'add-per-diem',
          expenseType: 'PER_DIEM',
          //actionFn: vm.createExpense
        },
        addExpense: {
          name: 'Add Expense',
          icon: 'add-expense',
          expenseType: 'EXPENSE',
          //actionFn: vm.createExpense
        },
        instafyle: {
          name: 'Instafyle',
          icon: 'instafyle',
          expenseType: 'AUTO_FYLE',
          //actionFn: vm.createExpense
        },
        addMileage: {
          name: 'Add Mileage',
          icon: 'add-mileage',
          expenseType: 'MILEAGE',
          //actionFn: vm.createExpense
        }
      };

      if (isInstaFyleEnabled) {
        this.ctaList.push(buttonList.addExpense);
        this.ctaList.push(buttonList.instafyle);

        if (isPerDiemEnabled && isMileageEnabled) {
          this.ctaList.unshift(buttonList.addPerDiem);
          this.ctaList.push(buttonList.addMileage);

        } else if (isPerDiemEnabled || isMileageEnabled) {
          if (isMileageEnabled) {
            this.ctaList.push(buttonList.addMileage);
          } else {
            this.ctaList.push(buttonList.addPerDiem);
          }
        }
      } else {
        this.ctaList.push(buttonList.addExpense);
        if (isMileageEnabled) {
          this.ctaList.push(buttonList.addMileage);
        }
        if (isPerDiemEnabled) {
          this.ctaList.push(buttonList.addPerDiem);
        }
      }
    } else {
      console.log("----coming here----");
      var cannotFyleExpenseCTA = {
        reports: {
          name: 'Create new report',
          icon: 'add-report',
          //actionFn: vm.goToCreateReport
        },
        trips: {
          name: 'Request new trip',
          icon: 'add-trip',
          //actionFn: vm.goToCreateTrip
        },
        advances: {
          name: 'Request new advance',
          icon: 'add-advance',
          //actionFn: vm.goToCreateAdvance
        }
      };
      this.ctaList = this.dashboardList.filter(function (element) {
        return (!element.isCollapsed && cannotFyleExpenseCTA[element.title]);
      }).map(function (element) {
        return cannotFyleExpenseCTA[element.title];
      });
    }
    this.gridSize = Math.floor(12 / this.ctaList.length);
  }

  reset (state: string) {
    this.canCreateExpense= this.dashboardList.some(function (element) {
      if (state === 'default') {
        return true;
      } else {
        return (!element.isCollapsed && (element.title === 'expenses' || element.title === 'corporate cards'));
      }
      
    });    
    this.setIconList();
  }

  ngOnInit() {
  	console.log("in footer");
    this.canCreateExpense = true;
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const orgSettings$ = this.offlineService.getOrgSettings();

    const primaryData$ = forkJoin({
      orgUserSettings$,
      orgSettings$
    });

    primaryData$.subscribe((res) => {
      this.orgUserSettings = res.orgUserSettings$;
      this.orgSettings = res.orgSettings$;
      this.setIconList();
    })

    this.dashboardService.getDashBoardState().subscribe((state)=> {
      this.reset(state);
    })
   
  }

}
