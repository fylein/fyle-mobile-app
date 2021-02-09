import { Injectable } from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyUsedItemsService {

  constructor(
    private apiService: ApiService
  ) { }

  getRecentlyUsedV2 () {
    return this.apiService.get('/recently_used');
  }
}