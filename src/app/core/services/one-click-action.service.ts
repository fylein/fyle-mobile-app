import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OneClickActionService {

  constructor() { }

  oneClickActionOptions = [
    { 
      value: 'insta_fyle', 
      label: 'Insta fyle'
    },
    { 
      value: 'mileage', 
      label: 'Mileage'
    }
  ];

  getAllOneClickActionOptions () {
    return this.oneClickActionOptions;
  }

  filterByOneClickActionById(value) {
    return this.oneClickActionOptions.find(element => element.value === value);
  }
}
