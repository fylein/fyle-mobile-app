import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileEventService {
  cardExpandedSubject = new Subject();
  cardCollapsedSubject = new Subject();

  constructor() { }

  onDashboardCardExpanded() {
    return this.cardExpandedSubject.asObservable();
  }

  dashboardCardExpanded() {
    return this.cardExpandedSubject.next();
  }

  onDashboardCardCollapsed() {
    return this.cardCollapsedSubject.asObservable();
  }

  dashboardCardCollapsed() {
    return this.cardCollapsedSubject.next();
  }
}
