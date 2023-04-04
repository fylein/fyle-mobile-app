import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FileService } from 'src/app/core/services/file.service';
import { ExpenseCardLiteComponent } from './expense-card-lite.component';
import { IonicModule } from '@ionic/angular';
import { MatIconModule } from '@angular/material/icon';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { fileObjectData1, thumbnailUrlMockData } from 'src/app/core/mock-data/file-object.data';
import { of } from 'rxjs';
import { expenseData1 } from 'src/app/core/mock-data/expense.data';
import { getElementBySelector, getTextContent } from 'src/app/core/dom-helpers';

describe('ExpenseCardLiteComponent', () => {
  let expenseCardLiteComponent: ExpenseCardLiteComponent;
  let fixture: ComponentFixture<ExpenseCardLiteComponent>;
  let fileService: jasmine.SpyObj<FileService>;

  beforeEach(waitForAsync(() => {
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['getFilesWithThumbnail', 'downloadThumbnailUrl']);
    fileServiceSpy.getFilesWithThumbnail.and.returnValue(of(fileObjectData1));
    fileServiceSpy.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData));
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

    fixture = TestBed.createComponent(ExpenseCardLiteComponent);
    expenseCardLiteComponent = fixture.componentInstance;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    expenseCardLiteComponent.expense = expenseData1;
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
      fileService.getFilesWithThumbnail.and.returnValue(of(fileObjectData1));
      fileService.downloadThumbnailUrl.and.returnValue(of(thumbnailUrlMockData));
      expenseCardLiteComponent.getReceipt();
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledWith(expenseCardLiteComponent.expense.id);
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledTimes(2);
      expect(fileService.downloadThumbnailUrl).toHaveBeenCalledWith(fileObjectData1[0].id);
      expect(fileService.downloadThumbnailUrl).toHaveBeenCalledTimes(2);
      expect(expenseCardLiteComponent.receiptThumbnail).toEqual(thumbnailUrlMockData[0].url);
    });

    it('should set receiptThumbnail to null if there are no thumbnail files', () => {
      fixture.detectChanges();
      fileService.getFilesWithThumbnail.and.returnValue(of([]));
      expenseCardLiteComponent.getReceipt();
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledWith(expenseCardLiteComponent.expense.id);
      expect(fileService.getFilesWithThumbnail).toHaveBeenCalledTimes(2);
      expect(expenseCardLiteComponent.receiptThumbnail).toEqual(thumbnailUrlMockData[0].url);
    });
  });

  it('should display the thumbnail when available', () => {
    expenseCardLiteComponent.receiptThumbnail = 'mock-thumbnail-url';
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
    const iconSrc = icon.getAttribute('src');
    expect(icon).toBeTruthy();
  });

  it('should display Unspecified if purpose is not present', () => {
    fixture.detectChanges();
    const purpose = getElementBySelector(fixture, '.expenses-card--category');
    expect(getTextContent(purpose)).toEqual('Unspecified');
  });
});
