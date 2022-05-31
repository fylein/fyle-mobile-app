import { Component, OnInit, Input } from '@angular/core';
import { isNumber } from 'lodash';
import { forkJoin } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { OfflineService } from 'src/app/core/services/offline.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { ReportService } from 'src/app/core/services/report.service';
import { map } from 'rxjs/operators';
import { RefinerService } from 'src/app/core/services/refiner.service';

@Component({
  selector: 'app-resubmit-report-popover',
  templateUrl: './resubmit-report-popover.component.html',
  styleUrls: ['./resubmit-report-popover.component.scss'],
})
export class ResubmitReportPopoverComponent implements OnInit {
  @Input() erpt;

  @Input() etxns;

  numIssues = 0;

  numCriticalPolicies = 0;

  showTripRequestWarning = false;

  constructor(
    private popoverController: PopoverController,
    private offlineService: OfflineService,
    private tripRequestService: TripRequestsService,
    private reportService: ReportService,
    private refinerService: RefinerService
  ) {}

  ngOnInit() {
    this.numCriticalPolicies = this.getCriticalPolicyViolations(this.etxns);
    this.numIssues = this.getNumIssues(this.etxns);
    forkJoin({
      orgSettings: this.offlineService.getOrgSettings(),
      orgUserSettings: this.offlineService.getOrgUserSettings(),
      approvedButUnreportedTripRequests: this.tripRequestService
        .findMyUnreportedRequests()
        .pipe(map((requests) => requests.filter((request) => request.state === 'APPROVED'))),
    }).subscribe(({ orgSettings, orgUserSettings, approvedButUnreportedTripRequests }) => {
      const canAssociateTripRequests =
        orgSettings.trip_requests.enabled &&
        (!orgSettings.trip_requests.enable_for_certain_employee ||
          (orgSettings.trip_requests.enable_for_certain_employee &&
            orgUserSettings.trip_request_org_user_settings.enabled));
      const isTripRequestsEnabled = orgSettings.trip_requests.enabled;
      this.showTripRequestWarning =
        (canAssociateTripRequests || !isTripRequestsEnabled) &&
        !this.erpt.rp_trip_request_id &&
        approvedButUnreportedTripRequests &&
        approvedButUnreportedTripRequests.length > 0;
    });
  }

  getCriticalPolicyViolations(etxns) {
    let count = 0;
    etxns.forEach((etxn) => {
      if (etxn.tx_policy_flag && isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001) {
        count = count + 1;
      }
    });
    return count;
  }

  getNumIssues(etxns) {
    let count = 0;

    for (let i = 0; i < etxns.length; i++) {
      const etxn = etxns[i];
      if (etxn.tx_policy_flag) {
        count = count + 1;
      }
    }

    for (let i = 0; i < etxns.length; i++) {
      const etxn = etxns[i];
      if (etxn.tx_manual_flag) {
        count = count + 1;
      }
    }

    return count;
  }

  cancel() {
    this.popoverController.dismiss();
  }

  filterCriticalViolations(etxn) {
    return etxn.tx_policy_flag && isNumber(etxn.tx_policy_amount) && etxn.tx_policy_amount < 0.0001;
  }

  excludeCriticalViolations(etxn) {
    return !etxn.tx.policy_flag && !(isNumber(etxn.tx.policy_amount) && etxn.tx.policy_amount < 0.0001);
  }

  resubmitReportAfterReview(event) {
    event.preventDefault();
    event.stopPropagation();

    this.reportService.resubmit(this.erpt.rp_id).subscribe(() => {
      this.popoverController.dismiss({
        goBack: true,
      });

      this.refinerService.startSurvey({ actionName: 'Resubmit Report ' });
    });
  }
}
