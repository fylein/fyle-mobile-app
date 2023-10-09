import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FileService } from 'src/app/core/services/file.service';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { of } from 'rxjs';
import { fileObjectData } from 'src/app/core/mock-data/file-object.data';

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;
  let fileService: jasmine.SpyObj<FileService>;

  beforeEach(waitForAsync(() => {
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId']);

    TestBed.configureTestingModule({
      declarations: [ExpenseCardLiteComponent, CurrencySymbolPipe],
      imports: [IonicModule.forRoot(), MatIconModule, MatIconTestingModule],
      providers: [
        {
          provide: FileService,
          useValue: fileServiceSpy,
        },
      ],
    }).compileComponents();
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;

    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    expenseCardLiteComponent = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(expenseCardLiteComponent).toBeTruthy();
  });

  const initialSetup = (fileData) => {
    fileService.findByTransactionId.and.returnValue(of(fileData));
    expenseCardLiteComponent.expense = { id: 'txn1234' };
    fixture.detectChanges();
  };

  describe('getReceipt():', () => {
    it('should set isReceiptPresent to true when files are present', () => {
      initialSetup([fileObjectData]);
      expect(fileService.findByTransactionId).toHaveBeenCalledWith('txn1234');
      expect(expenseCardLiteComponent.isReceiptPresent).toBeTruthy();
    });

    it('should set isReceiptPresent to false when no files are present', () => {
      initialSetup([]);
      expect(fileService.findByTransactionId).toHaveBeenCalledWith('txn1234');
      expect(expenseCardLiteComponent.isReceiptPresent).toBeFalsy();
    });
  });

  it('should display the recipt when available', () => {
    initialSetup([fileObjectData]);
    const element = fixture.nativeElement;
    const receiptContainer = element.querySelector('.expenses-card--receipt-image-container');
    expect(receiptContainer).toBeTruthy();
  });

  it('should display a default icon when no receipt available', () => {
    initialSetup([]);
    const element = fixture.nativeElement;
    const icon = element.querySelector('.expenses-card--receipt-icon');
    expect(icon).toBeTruthy();
  });

  it('should display "Unspecified" if purpose is not present', () => {
    initialSetup([]);
    const purpose = getElementBySelector(fixture, '.expenses-card--category');
    expect(getTextContent(purpose)).toEqual('Unspecified');
  });
});
