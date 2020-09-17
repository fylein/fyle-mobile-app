import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileEventService {
	cardExpandedSubject = new Subject();

  constructor() { }

  onDashboardCardExpanded() {
    console.log("-------on onDashboardCardExpanded------");
  	return this.cardExpandedSubject.asObservable();
  }

  dashboardCardExpanded() {
    console.log("-------dashboardCardExpanded------")
  	return this.cardExpandedSubject.next();
  }


}
