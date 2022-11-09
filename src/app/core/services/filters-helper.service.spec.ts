import { TestBed } from '@angular/core/testing';
import { FiltersHelperService } from './filters-helper.service';
import { Filters } from '../models/filters.model';
import { AdvancesStates } from '../models/advances-states.model';
import { FilterPill } from 'src/app/shared/components/fy-filter-pills/filter-pill.interface';

xdescribe('FiltersHelperService', () => {
  let service: FiltersHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltersHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate filter pills using only state APPROVED defined in filters', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.approved],
    };

    const TestPill: FilterPill[] = [
      {
        label: 'State',
        type: 'state',
        value: 'Approved',
      },
    ];
    expect(service.generateFilterPills(testFilters)).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(TestPill);
  });

  it('should generate filter pills using only state DRAFT defined in filters', () => {
    const testFilters: Filters = {
      state: [AdvancesStates.draft],
    };

    const TestPill: FilterPill[] = [
      {
        label: 'State',
        type: 'state',
        value: 'Draft',
      },
    ];
    expect(service.generateFilterPills(testFilters)).toBeTruthy();
    expect(service.generateFilterPills(testFilters)).toEqual(TestPill);
  });
});
