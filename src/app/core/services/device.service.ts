import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

const { Device } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  getDeviceInfo() {
    return from(Device.getInfo());
  }
}
