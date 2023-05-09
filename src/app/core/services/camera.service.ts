import { Injectable } from '@angular/core';
import { Camera, CameraPermissionType } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  constructor() {}

  requestCameraPermissions(permissionsType?: CameraPermissionType[]) {
    return Camera.requestPermissions({ permissions: permissionsType });
  }
}
