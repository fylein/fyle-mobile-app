import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private apiService: ApiService
  ) { }

  postUser(user: User) {
    return this.apiService.post('/users', user);
  }
}
