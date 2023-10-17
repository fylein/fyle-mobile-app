import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  get(): string {
    console.log('CategoriesService V2 get()');
    return 'data';
  }

  post(): string {
    console.log('CategoriesService V2 post()');
    return 'data';
  }
}
