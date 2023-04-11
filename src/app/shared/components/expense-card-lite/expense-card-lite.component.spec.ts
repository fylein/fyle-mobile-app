import { ComponentFixture, TestBed, async, waitForAsync } from '@angular/core/testing';
import { FileService } from 'src/app/core/services/file.service';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { fileObjectData1 } from 'src/app/core/mock-data/file-object.data';
import { of } from 'rxjs';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';
import { FileObject } from 'src/app/core/models/file-obj.model';

const thumbnailUrlMockData1: FileObject[] = [
  {
    id: 'fiwJ0nQTBpYH',
    purpose: 'THUMBNAILx200x200',
    url: '/assets/images/add-to-list.png',
  },
];

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;
  let fileService: jasmine.SpyObj<FileService>;

  beforeEach(waitForAsync(() => {
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['getFilesWithThumbnail', 'downloadThumbnailUrl']);
    fileServiceSpy.getFilesWithThumbnail.and.returnValue(of(fileObjectData1));
    fileServiceSpy.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData1));

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
    const expense = { id: 'txn1234' };
    expenseCardLiteComponent.expense = expense;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(expenseCardLiteComponent).toBeTruthy();
  });

  it('should call getReceipt on initialization', () => {
    spyOn(expenseCardLiteComponent, 'getReceipt');
    expenseCardLiteComponent.ngOnInit();
    expect(expenseCardLiteComponent.getReceipt).toHaveBeenCalledTimes(1);
  });

  describe('getReceipt():', () => {
    it('should set receiptThumbnail if there is at least one thumbnail file', () => {
      fixture.detectChanges();
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledOnceWith(expenseCardLiteComponent.expense.id);
      expect(fileService.downloadThumbnailUrl).toHaveBeenCalledOnceWith(fileObjectData1[0].id);
      expect(expenseCardLiteComponent.receiptThumbnail).toEqual(thumbnailUrlMockData1[0].url);
    });

    it('should return an empty array if there are no thumbnail files', () => {
      fileService.getFilesWithThumbnail.and.returnValue(of([]));
      fixture.detectChanges();
      expenseCardLiteComponent.getReceipt();
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledWith(expenseCardLiteComponent.expense.id);
      expect(expenseCardLiteComponent.receiptThumbnail).toEqual(thumbnailUrlMockData1[0].url);
    });
  });

  it('should display the thumbnail when available', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement;
    const thumbnailContainer = element.querySelector('.expenses-card--receipt-thumbnail-container');
    const backgroundImage = thumbnailContainer.style.backgroundImage;
    expect(thumbnailContainer).toBeTruthy();
    expect(backgroundImage).toContain(expenseCardLiteComponent.receiptThumbnail);
  });

  it('should display a default icon when no thumbnail available', () => {
    expenseCardLiteComponent.receiptThumbnail = null;
    fixture.detectChanges();

    const element = fixture.nativeElement;
    const icon = element.querySelector('.expenses-card--receipt-icon');
    expect(icon).toBeTruthy();
  });

  it('should display "Unspecified" if purpose is not present', () => {
    fixture.detectChanges();
    const purpose = getElementBySelector(fixture, '.expenses-card--category');
    expect(getTextContent(purpose)).toEqual('Unspecified');
  });
});
