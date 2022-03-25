import { createSelector } from '@ngrx/store';
import * as moment from 'moment';
import { DateFilters } from 'src/app/shared/components/fy-filters/date-filters.enum';

type Filters = Partial<{
  state: string[];
  date: string;
  customDateStart: Date;
  customDateEnd: Date;
  receiptsAttached: string;
  type: string[];
  sortParam: string;
  sortDir: string;
  searchString: string;
  pageNumber: number;
}>;

const today = new Date();

const year = today.getFullYear();

const month = today.getMonth();

const firstOfThisMonth = () => new Date(year, month, 1);

const lastOfThisMonth = () => new Date(year, month + 1, 0, 23, 59);

const getThisMonthRange = () => {
  const firstDay = firstOfThisMonth();
  const lastDay = lastOfThisMonth();
  const range = {
    from: firstDay,
    to: lastDay,
  };

  return range;
};

const firstOfThisWeek = () => moment().startOf('week');

const lastOfThisWeek = () => moment().startOf('week').add(7, 'days');

const getThisWeekRange = () => ({
  from: firstOfThisWeek(),
  to: lastOfThisWeek(),
});

const firstOfLastMonth = () => new Date(year, month - 1, 1);

const lastOfLastMonth = () => new Date(year, month, 0, 23, 59);

const getLastMonthRange = () => {
  const firstDay = firstOfLastMonth();
  const lastDay = lastOfLastMonth();
  const range = {
    from: firstDay,
    to: lastDay,
  };

  return range;
};

const generateTypeFilters = (newQueryParams, filters) => {
  const typeOrFilter = [];

  if (filters?.type) {
    if (filters?.type.includes('Mileage')) {
      typeOrFilter.push('tx_fyle_category.eq.Mileage');
    }

    if (filters?.type.includes('PerDiem')) {
      // The space encoding is done by angular into %20 so no worries here
      typeOrFilter.push('tx_fyle_category.eq.Per Diem');
    }

    if (filters?.type.includes('RegularExpenses')) {
      typeOrFilter.push('and(tx_fyle_category.not.eq.Mileage, tx_fyle_category.not.eq.Per Diem)');
    }
  }

  if (typeOrFilter.length > 0) {
    let combinedTypeOrFilter = typeOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
    combinedTypeOrFilter = `(${combinedTypeOrFilter})`;
    newQueryParams.or.push(combinedTypeOrFilter);
  }
};

const generateStateFilters = (newQueryParams, filters) => {
  const stateOrFilter = [];

  if (filters?.state) {
    newQueryParams.tx_report_id = 'is.null';
    if (filters?.state.includes('READY_TO_REPORT')) {
      stateOrFilter.push('and(tx_state.in.(COMPLETE),or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
    }

    if (filters?.state.includes('POLICY_VIOLATED')) {
      stateOrFilter.push('and(tx_policy_flag.eq.true,or(tx_policy_amount.is.null,tx_policy_amount.gt.0.0001))');
    }

    if (filters?.state.includes('CANNOT_REPORT')) {
      stateOrFilter.push('tx_policy_amount.lt.0.0001');
    }

    if (filters?.state.includes('DRAFT')) {
      stateOrFilter.push('tx_state.in.(DRAFT)');
    }
  }

  if (stateOrFilter.length > 0) {
    let combinedStateOrFilter = stateOrFilter.reduce((param1, param2) => `${param1}, ${param2}`);
    combinedStateOrFilter = `(${combinedStateOrFilter})`;
    newQueryParams.or.push(combinedStateOrFilter);
  }
};

const generateReceiptAttachedParams = (newQueryParams, filters) => {
  if (filters?.receiptsAttached) {
    if (filters?.receiptsAttached === 'YES') {
      newQueryParams.tx_num_files = 'gt.0';
    }

    if (filters?.receiptsAttached === 'NO') {
      newQueryParams.tx_num_files = 'eq.0';
    }
  }
};

const generateDateParams = (newQueryParams, filters) => {
  if (filters?.date) {
    filters.customDateStart = filters?.customDateStart && new Date(filters?.customDateStart);
    filters.customDateEnd = filters?.customDateEnd && new Date(filters?.customDateEnd);
    if (filters?.date === DateFilters?.thisMonth) {
      const thisMonth = getThisMonthRange();
      newQueryParams.and = `(tx_txn_dt.gte.${thisMonth.from.toISOString()},tx_txn_dt.lt.${thisMonth.to.toISOString()})`;
    }

    if (filters?.date === DateFilters?.thisWeek) {
      const thisWeek = getThisWeekRange();
      newQueryParams.and = `(tx_txn_dt.gte.${thisWeek.from.toISOString()},tx_txn_dt.lt.${thisWeek.to.toISOString()})`;
    }

    if (filters?.date === DateFilters?.lastMonth) {
      const lastMonth = getLastMonthRange();
      newQueryParams.and = `(tx_txn_dt.gte.${lastMonth.from.toISOString()},tx_txn_dt.lt.${lastMonth.to.toISOString()})`;
    }

    generateCustomDateParams(newQueryParams, filters);
  }
};

const generateCustomDateParams = (newQueryParams: any, filters) => {
  if (filters?.date === DateFilters.custom) {
    const startDate = filters?.customDateStart?.toISOString();
    const endDate = filters?.customDateEnd?.toISOString();
    if (filters?.customDateStart && filters?.customDateEnd) {
      newQueryParams.and = `(tx_txn_dt.gte.${startDate},tx_txn_dt.lt.${endDate})`;
    } else if (filters?.customDateStart) {
      newQueryParams.and = `(tx_txn_dt.gte.${startDate})`;
    } else if (filters?.customDateEnd) {
      newQueryParams.and = `(tx_txn_dt.lt.${endDate})`;
    }
  }
};

const setSortParams = (
  currentParams: Partial<{
    pageNumber: number;
    queryParams: any;
    sortParam: string;
    sortDir: string;
    searchString: string;
  }>,
  filters
) => {
  if (filters?.sortParam && filters?.sortDir) {
    currentParams.sortParam = filters?.sortParam;
    currentParams.sortDir = filters?.sortDir;
  } else {
    currentParams.sortParam = 'tx_txn_dt';
    currentParams.sortDir = 'desc';
  }
};

const getCurrentParams = (filters: Filters) => {
  const currentParams: Partial<{
    pageNumber: number;
    queryParams: any;
    sortParam: string;
    sortDir: string;
    searchString: string;
  }> = {};
  currentParams.pageNumber = filters?.pageNumber || 1;
  const newQueryParams: any = {
    or: [],
  };

  generateDateParams(newQueryParams, filters);

  generateReceiptAttachedParams(newQueryParams, filters);

  generateStateFilters(newQueryParams, filters);

  generateTypeFilters(newQueryParams, filters);

  setSortParams(currentParams, filters);

  currentParams.queryParams = newQueryParams;

  currentParams.searchString = filters?.searchString;

  return currentParams;
};

const selectParams = (currentState: Filters) => getCurrentParams(currentState);

export const paramsSelector = createSelector(selectParams, (x) => x);
