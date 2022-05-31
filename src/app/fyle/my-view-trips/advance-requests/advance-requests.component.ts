import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OfflineService } from 'src/app/core/services/offline.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-advance-requests',
  templateUrl: './advance-requests.component.html',
  styleUrls: ['./advance-requests.component.scss'],
})
export class AdvanceRequestsComponent implements OnInit {
  @Input() advanceRequests: any[];

  homeCurrency$: Observable<string>;

  constructor(private modalController: ModalController, private offlineService: OfflineService) {}

  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
  }
}
