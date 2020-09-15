import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(
    private apiService: ApiService
  ) { }

  getAllActive() {
    const data = {
      params: {
        active_only: true
      }
    };

    return this.apiService.get('/projects', data);
  }
}
