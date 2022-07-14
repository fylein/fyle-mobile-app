import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileEventService {
  cardExpandedSubject = new Subject();

  constructor() {}

  onDashboardCardExpanded() {
    return this.cardExpandedSubject.asObservable();
  }

  dashboardCardExpanded() {
    return this.cardExpandedSubject.next(null);
  }
}
