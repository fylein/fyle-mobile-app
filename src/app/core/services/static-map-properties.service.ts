import { Injectable } from '@angular/core';
import { StaticMapProperties } from '../models/static-map-properties.interface';

@Injectable({
  providedIn: 'root',
})
export class StaticMapPropertiesService {
  getProperties(): StaticMapProperties {
    return {
      zoom: 15,
      routeColor: '0x00BFFF',
      markers: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ],
      width: window.innerWidth,
      height: 266,
      resolutionScale: 2,
    };
  }
}
