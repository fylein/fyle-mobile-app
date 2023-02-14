import { TestBed } from '@angular/core/testing';
import { MergeExpensesService } from './merge-expenses.service';
import { ApiService } from './api.service';
import { FileService } from './file.service';
import { ProjectsService } from './projects.service';
import { CategoriesService } from './categories.service';
import { TaxGroupService } from './tax-group.service';
import { CustomInputsService } from './custom-inputs.service';
import { DateService } from './date.service';
import { CorporateCreditCardExpenseService } from './corporate-credit-card-expense.service';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';
import { FyCurrencyPipe } from 'src/app/shared/pipes/fy-currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { expensesWithDependentFields, expensesWithSameProject } from '../mock-data/expenses.data';
import { dependentFields } from '../mock-data/dependent-field.data';
import {
  projectDependentFieldsMapping,
  projectDependentFieldsMappingForNoDependentFields,
  projectDependentFieldsMappingForSameProject,
} from '../mock-data/project-dependent-field-mapping.data';

describe('MergeExpensesService', () => {
  let mergeExpensesService: MergeExpensesService;
  let apiService: jasmine.SpyObj<ApiService>;
  let fileService: jasmine.SpyObj<FileService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;
  let taxGroupService: jasmine.SpyObj<TaxGroupService>;
  let customInputsService: jasmine.SpyObj<CustomInputsService>;
  let dateService: jasmine.SpyObj<DateService>;
  let corporateCreditCardExpenseService: jasmine.SpyObj<CorporateCreditCardExpenseService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['post']);
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['findByTransactionId', 'downloadUrl']);
    const projectsServiceSpy = jasmine.createSpyObj('ProjectsService', ['getAllActive']);
    const categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['getAll', 'filterRequired']);
    const taxGroupServiceSpy = jasmine.createSpyObj('TaxGroupService', ['get']);
    const customInputsServiceSpy = jasmine.createSpyObj('CustomInputsService', ['getAll']);
    const dateServiceSpy = jasmine.createSpyObj('DateService', ['isValidDate']);
    const corporateCreditCardExpenseServiceSpy = jasmine.createSpyObj('CorporateCreditCardExpenseService', [
      'getv2CardTransactions',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MergeExpensesService,
        HumanizeCurrencyPipe,
        FyCurrencyPipe,
        CurrencyPipe,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: FileService, useValue: fileServiceSpy },
        { provide: ProjectsService, useValue: projectsServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: TaxGroupService, useValue: taxGroupServiceSpy },
        { provide: CustomInputsService, useValue: customInputsServiceSpy },
        { provide: DateService, useValue: dateServiceSpy },
        { provide: CorporateCreditCardExpenseService, useValue: corporateCreditCardExpenseServiceSpy },
      ],
    });
    mergeExpensesService = TestBed.inject(MergeExpensesService);

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
    taxGroupService = TestBed.inject(TaxGroupService) as jasmine.SpyObj<TaxGroupService>;
    customInputsService = TestBed.inject(CustomInputsService) as jasmine.SpyObj<CustomInputsService>;
    dateService = TestBed.inject(DateService) as jasmine.SpyObj<DateService>;
    corporateCreditCardExpenseService = TestBed.inject(
      CorporateCreditCardExpenseService
    ) as jasmine.SpyObj<CorporateCreditCardExpenseService>;
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
