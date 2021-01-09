import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { OfflineService } from 'src/app/core/services/offline.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enterprise-dashboard-footer',
  templateUrl: './enterprise-dashboard-footer.component.html',
  styleUrls: ['./enterprise-dashboard-footer.component.scss'],
})
export class EnterpriseDashboardFooterComponent implements OnInit, OnChanges {

  @Input() dashboardList: any[];

  ctaList: any[];
  canCreateExpense: boolean; // no idea why this variable is used
  gridSize: number;

  constructor(
    private offlineService: OfflineService,
    private dashboardService: DashboardService,
    private router: Router
  ) { }


  async setIconList() {
    const orgSettings = await this.offlineService.getOrgSettings().toPromise();
    const orgUserSettings = await this.offlineService.getOrgUserSettings().toPromise();
    const isInstaFyleEnabled = orgUserSettings ? orgUserSettings.insta_fyle_settings.enabled : false;
    const isBulkFyleEnabled = orgUserSettings ? orgUserSettings.bulk_fyle_settings.enabled : false;
    this.ctaList = [];

    if (this.canCreateExpense) {
      let isPerDiemEnabled = false;
      let isMileageEnabled = false;
      if (orgSettings && orgSettings.per_diem && orgSettings.per_diem.enabled) {
        isPerDiemEnabled = true;
      }

      // Org Settings related
      if (orgSettings && orgSettings.mileage && orgSettings.mileage.enabled) {
        isMileageEnabled = true;
      }

      const buttonList = {
        addPerDiem: {
          name: 'Add Per Diem',
          icon: 'add-per-diem',
          type: 'per_diem',
          route: ['/', 'enterprise', 'add_edit_per_diem']
        },
        addExpense: {
          name: 'Add Expense',
          icon: 'add-expense',
          type: 'expense',
          route: ['/', 'enterprise', 'add_edit_expense']
        },
        instafyle: {
          name: 'Instafyle',
          icon: 'instafyle',
          expenseType: 'AUTO_FYLE',
          type: 'auto_fyle',
          route: ['/', 'enterprise', 'camera_overlay']
        },
        addMileage: {
          name: 'Add Mileage',
          icon: 'add-mileage',
          type: 'mileage',
          route: ['/', 'enterprise', 'add_edit_mileage']
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
      const cannotFyleExpenseCTA = {
        reports: {
          name: 'Create new report',
          icon: 'add-report',
          type: 'report',
          cssClass: 'unit-action',
          route: ['/', 'enterprise', 'my_create_report']
        },
        trips: {
          name: 'Request new trip',
          icon: 'add-trip',
          type: 'trip',
          cssClass: 'unit-action',
          route: ['/', 'enterprise', 'my_add_edit_trip']
        },
        advances: {
          name: 'Request new advance',
          icon: 'add-advance',
          type: 'advance',
          cssClass: 'unit-action',
          route: ['/', 'enterprise', 'add_edit_advance_request']
        }
      };
      this.ctaList = this.dashboardList.filter((element) => {
        return (!element.isCollapsed && cannotFyleExpenseCTA[element.title]);
      }).map((element) => {
        return cannotFyleExpenseCTA[element.title];
      });
    }
    this.gridSize = Math.floor(12 / this.ctaList.length);
  }

  actionFn(item) {
    this.router.navigate(item.route);
  }

  reset(state: string) {
    this.canCreateExpense = this.dashboardList.some((element) => {
      if (state === 'default') {
        return true;
      } else {
        return (!element.isCollapsed && (element.title === 'expenses' || element.title === 'corporate cards'));
      }
    });

    this.setIconList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.canCreateExpense = true;
    this.setIconList();

    this.dashboardService.getDashBoardState().subscribe((state) => {
      this.reset(state);
    });
  }

  ngOnInit() {

  }
}
