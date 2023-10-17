import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  get(): string {
    console.log('CategoriesService V1 get()');
    return 'data';
  }

  post(): string {
    console.log('CategoriesService V1 post()');
    return 'data';
  }
}
