import { Component, OnInit, Input } from '@angular/core';
import { ExtendedReport } from 'src/app/core/models/report.model';

@Component({
  selector: 'app-my-reports-card',
  templateUrl: './my-reports-card.component.html',
  styleUrls: ['./my-reports-card.component.scss'],
})
export class MyReportsCardComponent implements OnInit {

  @Input() erpt: ExtendedReport;
  actionOpened = false;

  constructor() { }

  ngOnInit() {
  }

  deleteReport() {

  }

  goToReport() {

  }

  viewComments() {
    
  }
}
