import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomInputsService {

  constructor(
    private apiService: ApiService
  ) { }

  getAll(active: boolean) {
    return this.apiService.get('/custom_inputs/custom_properties', { params: { active } });
  }
}
