import { TestBed } from '@angular/core/testing';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { dependentFields } from '../mock-data/dependent-field.data';
import { expensesWithDependentFields, expensesWithSameProject } from '../mock-data/expenses.data';
import {
  projectDependentFieldsMapping,
  projectDependentFieldsMappingForNoDependentFields,
  projectDependentFieldsMappingForSameProject,
} from '../mock-data/project-dependent-field-mapping.data';
import { ApiService } from './api.service';
import { CategoriesService } from './categories.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { CustomInputsService } from './custom-inputs.service';
import { DateService } from './date.service';
import { FileService } from './file.service';
import { MergeExpensesService } from './merge-expenses.service';
import { ProjectsService } from './projects.service';
import { TaxGroupService } from './tax-group.service';

describe('MergeExpensesService', () => {
  let mergeExpensesService: MergeExpensesService;
  let apiService: jasmine.SpyObj<ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let humanizeCurrencyPipe: jasmine.SpyObj<HumanizeCurrencyPipe>;
  let projectService: jasmine.SpyObj<ProjectsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let dateService: jasmine.SpyObj<DateService>;
  let taxGroupService: jasmine.SpyObj<TaxGroupService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId', 'downloadUrl']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getv2CardTransactions',
    ]);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll']);
    const humanizeCurrencyPipeSpy = jasmine.createSpyObj('HumanizeCurrencyPipe', ['transform']);
    const projectServiceSpy = jasmine.createSpyObj('ProjectsService', ['getAllActive']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll', 'filterRequired']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['isValidDate']);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        MergeExpensesService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: HumanizeCurrencyPipe, useValue: humanizeCurrencyPipeSpy },
        { provide: ProjectsService, useValue: projectServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: TaxGroupService, useValue: taxGroupServiceSpy },
      ],
    });
    mergeExpensesService = TestBed.inject(MergeExpensesService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    humanizeCurrencyPipe = TestBed.inject(HumanizeCurrencyPipe) as jasmine.SpyObj<HumanizeCurrencyPipe>;
    projectService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
  });

  it('should be created', () => {
    expect(mergeExpensesService).toBeTruthy();
  });

  describe('getProjectDependentFieldsMapping(): ', () => {
    it('should return the correct project dependent fields mapping when projects are different', () => {
      expect(
        mergeExpensesService.getProjectDependentFieldsMapping(expensesWithDependentFields, dependentFields)
      ).toEqual(projectDependentFieldsMapping);
    });

    it('should return the correct project dependent fields mapping when projects are same', () => {
      expect(mergeExpensesService.getProjectDependentFieldsMapping(expensesWithSameProject, dependentFields)).toEqual(
        projectDependentFieldsMappingForSameProject
      );
    });

    it('should return empty array when there are no dependent fields', () => {
      expect(mergeExpensesService.getProjectDependentFieldsMapping(expensesWithSameProject, null)).toEqual(
        projectDependentFieldsMappingForNoDependentFields
      );
    });
  });
});
