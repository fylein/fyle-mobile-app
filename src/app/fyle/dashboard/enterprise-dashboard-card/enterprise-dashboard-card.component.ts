import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-enterprise-dashboard-card',
  templateUrl: './enterprise-dashboard-card.component.html',
  styleUrls: ['./enterprise-dashboard-card.component.scss'],
})
export class EnterpriseDashboardCardComponent implements OnInit {
	item: any

  @Input() dashboardList: any[];
  @Input() index: number;
  constructor() { }

  ngOnInit() {
  	//console.log(this.dashboardList);
  	//console.log(this.index);
    this.item = this.dashboardList[this.index];
    console.log(this.item)
  }

}
