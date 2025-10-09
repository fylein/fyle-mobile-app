import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarPropertiesService } from '../../../core/services/snackbar-properties.service';
import { ToastDemoComponent } from './toast-demo.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';

describe('ToastDemoComponent', () => {
  let component: ToastDemoComponent;
  let fixture: ComponentFixture<ToastDemoComponent>;
  let matSnackBar: jasmine.SpyObj<MatSnackBar>;
  let snackbarProperties: jasmine.SpyObj<SnackbarPropertiesService>;

  beforeEach(async () => {
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']);
    const snackbarPropertiesSpy = jasmine.createSpyObj('SnackbarPropertiesService', ['setSnackbarProperties']);

    await TestBed.configureTestingModule({
      imports: [ToastDemoComponent, MatSnackBarModule, MatIconModule, MatIconTestingModule],
      providers: [
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: SnackbarPropertiesService, useValue: snackbarPropertiesSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastDemoComponent);
    component = fixture.componentInstance;
    matSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    snackbarProperties = TestBed.inject(SnackbarPropertiesService) as jasmine.SpyObj<SnackbarPropertiesService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all toasts defined', () => {
    expect(component.allToasts).toBeDefined();
    expect(component.allToasts.length).toBeGreaterThan(0);
  });

  it('should have success toasts', () => {
    const successToasts = component.allToasts.filter(toast => toast.type === 'success');
    expect(successToasts.length).toBeGreaterThan(0);
  });

  it('should have failure toasts', () => {
    const failureToasts = component.allToasts.filter(toast => toast.type === 'failure');
    expect(failureToasts.length).toBeGreaterThan(0);
  });

  it('should have information toasts', () => {
    const informationToasts = component.allToasts.filter(toast => toast.type === 'information');
    expect(informationToasts.length).toBeGreaterThan(0);
  });

  it('should call showToast when a toast is triggered', () => {
    const testToast = component.allToasts[0];
    snackbarProperties.setSnackbarProperties.and.returnValue({
      data: { message: testToast.message, messageType: testToast.type },
      duration: 3000,
    });

    component.showToast(testToast);

    expect(snackbarProperties.setSnackbarProperties).toHaveBeenCalledWith(
      testToast.type,
      { message: testToast.message, redirectionText: testToast.redirectionText },
      testToast.icon
    );
    expect(matSnackBar.openFromComponent).toHaveBeenCalled();
  });

  it('should return correct toast count for each type', () => {
    const successCount = component.getToastCount('success');
    const failureCount = component.getToastCount('failure');
    const informationCount = component.getToastCount('information');

    expect(successCount).toBeGreaterThan(0);
    expect(failureCount).toBeGreaterThan(0);
    expect(informationCount).toBeGreaterThan(0);
    expect(successCount + failureCount + informationCount).toBe(component.allToasts.length);
  });
});
