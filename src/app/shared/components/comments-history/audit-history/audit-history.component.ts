import { Component, OnInit, Input } from '@angular/core';
import { ExtendedStatus } from 'src/app/core/models/extended_status.model';

@Component({
  selector: 'app-audit-history',
  templateUrl: './audit-history.component.html',
  styleUrls: ['./audit-history.component.scss'],
})
export class AuditHistoryComponent implements OnInit {

  @Input() estatuses: ExtendedStatus[];

  constructor() { }

  ngOnInit() {
    console.log("check estatuses--", this.estatuses);
  }

}
