import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Org } from 'src/app/core/models/org.model';
import { IonicModule } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-active-org-card',
    templateUrl: './active-org-card.component.html',
    styleUrls: ['./active-org-card.component.scss'],
    imports: [IonicModule, TranslocoPipe],
})
export class ActiveOrgCardComponent implements OnInit {
  @Input() org: Org;

  @Input() isPrimaryOrg: boolean;

  @Input() isLoading = false;

  @Output() orgSelected = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  switchOrg() {
    this.orgSelected.emit();
  }
}
