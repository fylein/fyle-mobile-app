import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddEditExpensePage } from '../../fyle/add-edit-expense/add-edit-expense.page';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ModalController } from '@ionic/angular';
import { ExpensesService } from 'src/app/core/services/platform/v1/spender/expenses.service';
import { of, throwError } from 'rxjs';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { Expense } from 'src/app/core/models/platform/v1/expense.model';
import { UnflattenedTransaction } from 'src/app/core/models/unflattened-transaction.model';

describe('AddEditExpensePage', () => {
  let component: AddEditExpensePage;
  let fixture: ComponentFixture<AddEditExpensePage>;
  let loaderService: LoaderService;
  let modalController: ModalController;
  let expensesService: ExpensesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditExpensePage],
      providers: [LoaderService, ModalController, ExpensesService],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditExpensePage);
    component = fixture.componentInstance;
    loaderService = TestBed.inject(LoaderService);
    modalController = TestBed.inject(ModalController);
    expensesService = TestBed.inject(ExpensesService);
  });

  it('should upload receipts and increment count in edit mode', fakeAsync(() => {
    const mockAttachments = [
      {
        id: 'mock-attachment-id',
        name: 'mock-attachment.jpg',
        type: 'image/jpeg',
        url: 'mock-url',
        thumbnail: 'mock-thumbnail',
      },
    ];

    const mockExpense = {
      tx: {
        id: 'mock-expense-id',
        file_ids: ['mock-file-id'],
      },
      // Add required properties to satisfy the platform/v1 Expense model
      accounting_export_summary: null,
      is_exported: false,
      last_exported_at: null,
      added_to_report_at: null,
      // ...add other required properties as needed for your tests
    } as unknown as Expense;

    const mockModal = {
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss'),
    };

    spyOn(component, 'getExpenseAttachments').and.returnValue(of(mockAttachments));
    spyOn(loaderService, 'showLoader').and.resolveTo();
    spyOn(loaderService, 'hideLoader');
    spyOn(modalController, 'create').and.resolveTo(mockModal as any);
    spyOn(expensesService, 'getExpenseById').and.returnValue(of(mockExpense));

    mockModal.present.and.resolveTo();
    mockModal.onWillDismiss.and.resolveTo({ data: { attachments: mockAttachments } });

    component.mode = 'edit';
    component.etxn$ = of(mockExpense as unknown as Partial<UnflattenedTransaction>);
    component.platformExpense$ = of(mockExpense);

    component.viewAttachments();
    tick(); // For loader.showLoader
    tick(); // For modal creation
    tick(); // For modal present
    tick(); // For modal onWillDismiss
    tick(); // For getExpenseById
    tick(); // For addAttachments

    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(component.getExpenseAttachments).toHaveBeenCalled();
    expect(modalController.create).toHaveBeenCalledWith({
      component: FyViewAttachmentComponent,
      componentProps: {
        attachments: mockAttachments,
        canEdit: true,
        expenseId: 'mock-expense-id',
      },
      mode: 'ios',
    });
    expect(mockModal.present).toHaveBeenCalled();
    expect(expensesService.getExpenseById).toHaveBeenCalledWith('mock-expense-id');
    expect(component.attachedReceiptsCount).toBe(1);
    expect(loaderService.hideLoader).toHaveBeenCalled();
  }));

  it('should handle error when getting expense by id', fakeAsync(() => {
    const mockAttachments = [
      {
        id: 'mock-attachment-id',
        name: 'mock-attachment.jpg',
        type: 'image/jpeg',
        url: 'mock-url',
        thumbnail: 'mock-thumbnail',
      },
    ];

    const mockExpense = {
      tx: {
        id: 'mock-expense-id',
        file_ids: ['mock-file-id'],
      },
    } as unknown as Expense;

    const mockModal = {
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss'),
    };

    spyOn(component, 'getExpenseAttachments').and.returnValue(of(mockAttachments));
    spyOn(loaderService, 'showLoader').and.resolveTo();
    spyOn(loaderService, 'hideLoader');
    spyOn(modalController, 'create').and.resolveTo(mockModal as any);
    spyOn(expensesService, 'getExpenseById').and.returnValue(throwError(() => new Error('Failed to get expense')));

    mockModal.present.and.resolveTo();
    mockModal.onWillDismiss.and.resolveTo({ data: { attachments: mockAttachments } });

    component.mode = 'edit';
    component.etxn$ = of(mockExpense as unknown as Partial<UnflattenedTransaction>);
    component.platformExpense$ = of(mockExpense);

    component.viewAttachments();
    tick(); // For loader.showLoader
    tick(); // For modal creation
    tick(); // For modal present
    tick(); // For modal onWillDismiss
    tick(); // For getExpenseById
    tick(); // For addAttachments

    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(component.getExpenseAttachments).toHaveBeenCalled();
    expect(modalController.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
    expect(expensesService.getExpenseById).toHaveBeenCalledWith('mock-expense-id');
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.attachedReceiptsCount).toBe(0);
  }));

  it('should handle modal dismissal without attachments', fakeAsync(() => {
    const mockAttachments = [
      {
        id: 'mock-attachment-id',
        name: 'mock-attachment.jpg',
        type: 'image/jpeg',
        url: 'mock-url',
        thumbnail: 'mock-thumbnail',
      },
    ];

    const mockExpense = {
      tx: {
        id: 'mock-expense-id',
        file_ids: ['mock-file-id'],
      },
    } as unknown as Expense;

    const mockModal = {
      present: jasmine.createSpy('present'),
      onWillDismiss: jasmine.createSpy('onWillDismiss'),
    };

    spyOn(component, 'getExpenseAttachments').and.returnValue(of(mockAttachments));
    spyOn(loaderService, 'showLoader').and.resolveTo();
    spyOn(loaderService, 'hideLoader');
    spyOn(modalController, 'create').and.resolveTo(mockModal as any);
    spyOn(expensesService, 'getExpenseById').and.returnValue(of(mockExpense));

    mockModal.present.and.resolveTo();
    mockModal.onWillDismiss.and.resolveTo({ data: { attachments: [] } });

    component.mode = 'edit';
    component.etxn$ = of(mockExpense as unknown as Partial<UnflattenedTransaction>);
    component.platformExpense$ = of(mockExpense);

    component.viewAttachments();
    tick(); // For loader.showLoader
    tick(); // For modal creation
    tick(); // For modal present
    tick(); // For modal onWillDismiss
    tick(); // For getExpenseById
    tick(); // For addAttachments

    expect(loaderService.showLoader).toHaveBeenCalled();
    expect(component.getExpenseAttachments).toHaveBeenCalled();
    expect(modalController.create).toHaveBeenCalled();
    expect(mockModal.present).toHaveBeenCalled();
    expect(expensesService.getExpenseById).not.toHaveBeenCalled();
    expect(loaderService.hideLoader).toHaveBeenCalled();
    expect(component.attachedReceiptsCount).toBe(0);
  }));
});
