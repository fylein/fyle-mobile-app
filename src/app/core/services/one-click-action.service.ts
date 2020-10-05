import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OneClickActionService {

  constructor() { }

  oneClickActionOptions = [
    { 
      id: 'insta_fyle', 
      name: 'Insta fyle'
    },
    { 
      id: 'mileage', 
      name: 'Mileage'
    }
  ];

  getAllOneClickActionOptions () {
    return this.oneClickActionOptions;
  }

  filterByOneClickActionById(id) {
    return this.oneClickActionOptions.find(element => element.id === id);

  }
}
