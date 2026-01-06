import deepFreeze from 'deep-freeze-strict';
import { Budget } from 'src/app/core/models/budget.model';

export const budgetData: Budget = deepFreeze({
  id: 'budget123',
  org_id: 'org123',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-05T00:00:00.000Z',
  is_enabled: true,
  name: 'Monthly Marketing Budget',
  type: 'MONTHLY',
  amount_limit: 5000,
  alert_threshold: 900,
  department_ids: ['dept1', 'dept2'],
  project_ids: [],
  cost_center_ids: [],
  category_ids: [101, 102],
  observer_ids: ['user1'],
  fiscal_year_start_month: 4,
  budget_start_date: '2025-01-01T00:00:00.000Z',
  budget_end_date: '2025-01-31T23:59:59.000Z',
  budget_creator: {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  amount_spent: 1000,
  amount_remaining: 4000,
  utilisation_percentage: 20,
  status: 'ON_TRACK',
});

export const budgetWithProjectsData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget456',
  department_ids: [],
  project_ids: ['proj1', 'proj2'],
  category_ids: [201],
});

export const budgetWithCostCentersData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget789',
  department_ids: [],
  project_ids: [],
  cost_center_ids: ['cc1', 'cc2'],
  category_ids: [301],
});

export const budgetDepartmentsOnlyData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget101',
  department_ids: ['dept1'],
  project_ids: [],
  cost_center_ids: [],
  category_ids: [],
});

export const budgetCategoriesOnlyData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget102',
  department_ids: [],
  project_ids: [],
  cost_center_ids: [],
  category_ids: [401],
});

export const budgetProjectsOnlyData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget103',
  department_ids: [],
  project_ids: ['proj1'],
  cost_center_ids: [],
  category_ids: [],
});

export const budgetCostCentersOnlyData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget104',
  department_ids: [],
  project_ids: [],
  cost_center_ids: ['cc1'],
  category_ids: [],
});

export const budgetUnknownTypeData: Budget = deepFreeze({
  ...budgetData,
  id: 'budget105',
  department_ids: [],
  project_ids: [],
  cost_center_ids: [],
  category_ids: [],
});
