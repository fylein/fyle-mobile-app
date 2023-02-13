import { TestBed } from '@angular/core/testing';
import { ModalPropertiesService } from './modal-properties.service';

describe('ModalPropertiesService', () => {
  let service: ModalPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalPropertiesService);
  });

  it('getModalDefaultProperties(): should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getModalDefaultProperties():should return default properties for a modal', () => {
    const properties = service.getModalDefaultProperties();
    expect(properties).toEqual({
      cssClass: 'fy-modal',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
  });

  it('getModalDefaultProperties():should return custom properties for a modal', () => {
    const properties = service.getModalDefaultProperties('custom-class');
    expect(properties).toEqual({
      cssClass: 'custom-class',
      showBackdrop: true,
      canDismiss: true,
      backdropDismiss: true,
      animated: true,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: false,
    });
  });
});
