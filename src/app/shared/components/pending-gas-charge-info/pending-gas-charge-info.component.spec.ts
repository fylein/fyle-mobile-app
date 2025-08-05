import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingGasChargeInfoComponent } from './pending-gas-charge-info.component';
import { ModalController } from '@ionic/angular';
import { PendingGasChargeInfoModalComponent } from '../pending-gas-charge-info-modal/pending-gas-charge-info-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconModule } from 'src/app/shared/icon/icon.module';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

describe('PendingGasChargeInfoComponent', () => {
  let component: PendingGasChargeInfoComponent;
  let fixture: ComponentFixture<PendingGasChargeInfoComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let translocoServiceSpy: jasmine.SpyObj<TranslocoService>;

  beforeEach(async () => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);
    translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);
    translocoServiceSpy.translate.and.returnValue('translated text');

    await TestBed.configureTestingModule({
      imports: [MatIconModule, HttpClientTestingModule, IconModule, TranslocoModule],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingGasChargeInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have isExpenseListView input property', () => {
      expect(component.isExpenseListView).toBeUndefined();

      component.isExpenseListView = true;
      expect(component.isExpenseListView).toBeTrue();

      component.isExpenseListView = false;
      expect(component.isExpenseListView).toBeFalse();
    });

    it('should update signal when input changes', () => {
      component.isExpenseListView = true;
      expect(component.expenseListViewClass()).toBe('pending-gas-charge-info--expense-list-view');

      component.isExpenseListView = false;
      expect(component.expenseListViewClass()).toBe('');
    });
  });

  describe('openPendingGasChargeInfoModal', () => {
    let mockModal: any;
    let mockEvent: Event;

    beforeEach(() => {
      mockModal = {
        present: jasmine.createSpy('present'),
      };
      mockEvent = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      } as any;

      modalControllerSpy.create.and.resolveTo(mockModal);
    });

    it('should create and present modal with correct properties', async () => {
      await component.openPendingGasChargeInfoModal(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(modalControllerSpy.create).toHaveBeenCalledWith({
        component: PendingGasChargeInfoModalComponent,
        cssClass: 'pending-gas-charge-info-modal',
        showBackdrop: true,
        canDismiss: true,
        backdropDismiss: true,
        animated: true,
        initialBreakpoint: 1,
        breakpoints: [0, 1],
        handle: false,
      });
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should stop event propagation', async () => {
      await component.openPendingGasChargeInfoModal(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle modal creation error gracefully', async () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      modalControllerSpy.create.and.rejectWith(new Error('Modal creation failed'));

      try {
        await component.openPendingGasChargeInfoModal(mockEvent);
      } catch (error) {
        expect(error.message).toBe('Modal creation failed');
      }

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(modalControllerSpy.create).toHaveBeenCalled();
    });
  });

  describe('Component Properties', () => {
    it('should handle isExpenseListView property correctly', () => {
      expect(component.isExpenseListView).toBeUndefined();

      component.isExpenseListView = true;
      expect(component.isExpenseListView).toBeTrue();

      component.isExpenseListView = false;
      expect(component.isExpenseListView).toBeFalse();
    });

    it('should compute expenseListViewClass correctly', () => {
      expect(component.expenseListViewClass()).toBe('');

      component.isExpenseListView = true;
      expect(component.expenseListViewClass()).toBe('pending-gas-charge-info--expense-list-view');

      component.isExpenseListView = false;
      expect(component.expenseListViewClass()).toBe('');
    });
  });

  describe('Event Handling', () => {
    it('should call openPendingGasChargeInfoModal when clicked', () => {
      spyOn(component, 'openPendingGasChargeInfoModal');
      const element = fixture.nativeElement;
      const container = element.querySelector('.pending-gas-charge-info');

      container.click();

      expect(component.openPendingGasChargeInfoModal).toHaveBeenCalled();
    });
  });

  describe('openHelpArticle', () => {
    it('should open help article in new window', () => {
      spyOn(window, 'open');

      component.openHelpArticle();

      expect(window.open).toHaveBeenCalledWith('https://www.fylehq.com/help/en/articles/', '_blank');
    });
  });

  describe('Edge Cases', () => {
    it('should handle modal creation failure gracefully', async () => {
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;

      modalControllerSpy.create.and.rejectWith(new Error('Modal creation failed'));

      try {
        await component.openPendingGasChargeInfoModal(mockEvent);
      } catch (error) {
        expect(error.message).toBe('Modal creation failed');
      }

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(modalControllerSpy.create).toHaveBeenCalled();
    });

    it('should handle undefined isExpenseListView gracefully', () => {
      component.isExpenseListView = undefined;
      expect(component.expenseListViewClass()).toBe('');
    });
  });
});
