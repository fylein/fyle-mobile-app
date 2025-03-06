import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  footerCurrentStateIndex = new BehaviorSubject<number>(0);

  footerCurrentStateIndex$ = this.footerCurrentStateIndex.asObservable();

  selectionMode = new BehaviorSubject<boolean>(false);

  selectionMode$ = this.selectionMode.asObservable();

  updateCurrentStateIndex(index: number): void {
    this.footerCurrentStateIndex.next(index);
  }

  updateSelectionMode(isEnabled: boolean): void {
    this.selectionMode.next(isEnabled);
  }
}
