import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignupDetailsService {

  constructor() { }

  getEmployeeRangeList() {
    return ['2-50', '51-200', '201-500', '500-2500', '2500+'];
  }

  getRolesList() {
    return ['HR', 'Admin', 'Finance', 'Accounts', 'Sales', 'C-Suite', 'Others'];
  }
}
