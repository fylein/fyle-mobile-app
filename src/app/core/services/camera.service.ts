import { Injectable } from '@angular/core';
import { Camera, CameraPermissionType, GalleryImageOptions, GalleryPhotos, PermissionStatus } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class CameraService {
  constructor() {}

  requestCameraPermissions(permissionsType?: CameraPermissionType[]) {
    return Camera.requestPermissions({ permissions: permissionsType });
  }

  pickImages(options: GalleryImageOptions): Promise<GalleryPhotos> {
    return Camera.pickImages(options);
  }

  checkPermissions(): Promise<PermissionStatus> {
    return Camera.checkPermissions();
  }
}
