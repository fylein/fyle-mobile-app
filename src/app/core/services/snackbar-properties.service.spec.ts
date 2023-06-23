import { TestBed } from '@angular/core/testing';

import { SnackbarPropertiesService } from './snackbar-properties.service';

describe('SnackbarPropertiesService', () => {
  let service: SnackbarPropertiesService;

  beforeEach(() => {
    //arrange
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the correct icon for a success toast message', () => {
    //act
    const properties = service.setSnackbarProperties('success', { message: 'Success message' });
    //assert
    expect(properties.data.icon).toEqual('tick-square-filled');
  });

  it('should return the correct icon for a failure toast message', () => {
    const properties = service.setSnackbarProperties('failure', { message: 'Failure message' });
    expect(properties.data.icon).toEqual('danger');
  });

  it('should return correct icon for a information toast message', () => {
    const properties = service.setSnackbarProperties('information', { message: 'Information message' });
    expect(properties.data.icon).toEqual('');
  });

  it('should return the correct duration', () => {
    const properties = service.setSnackbarProperties('success', { message: 'Success message' });
    expect(properties.duration).toEqual(3000);
  });

  it('should return redirection text in data', () => {
    const properties = service.setSnackbarProperties('success', {
      message: 'Success message',
      redirectionText: 'redirection',
    });
    expect(properties.data.message).toEqual('Success message');
    expect(properties.data.redirectionText).toEqual('redirection');
  });

  it('should return showCloseButton as true', () => {
    const properties = service.setSnackbarProperties('success', { message: 'Success message' });
    expect(properties.data.showCloseButton).toEqual(true);
  });
});
