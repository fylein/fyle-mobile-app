import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecentlyUsed } from '../models/recently_used.model';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RecentlyUsedItemsService {

  constructor(
    private apiService: ApiService
  ) { }

  getRecentlyUsedV2():Observable<RecentlyUsed> {
    return this.apiService.get('/recently_used');
  }
}