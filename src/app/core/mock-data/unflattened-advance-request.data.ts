import { UnflattenedAdvanceRequest } from '../models/unflattened-advance-request.model';

export const unflattenedAdvanceRequestData: UnflattenedAdvanceRequest = {
  areq: {
    id: 'areqLFKMxUSAlQ',
    created_at: new Date('2023-10-03T09:20:22.112Z'),
    approved_at: null,
    purpose: 'hello',
    notes: 'fdv',
    state: 'SUBMITTED',
    currency: 'USD',
    amount: 2,
    org_user_id: 'ouuJzJYWcnzP',
    advance_id: null,
    policy_amount: null,
    policy_flag: null,
    policy_state: 'SUCCESS',
    project_id: null,
    custom_field_values: [
      {
        id: 159,
        name: 'Advance Request Place',
        value: 'd',
        type: null,
      },
      {
        id: 160,
        name: 'Category',
        value: 'Fyle is best',
        type: null,
      },
    ],
    updated_at: new Date('2023-10-03T14:50:22.552Z'),
    source: 'MOBILE',
    advance_request_number: 'AR/2023/10/R/1',
    updated_by: null,
    is_sent_back: null,
    is_pulled_back: null,
  },
  ou: {
    id: 'ouuJzJYWcnzP',
    org_id: 'orNbIQloYtfa',
    org_name: 'Advance-test',
    employee_id: null,
    location: null,
    level: null,
    business_unit: null,
    department: null,
    title: null,
    mobile: null,
    sub_department: null,
    department_id: null,
  },
  us: {
    full_name: 'Suyash',
    email: 'suyash.p@fyle.in',
    name: 'Suyash',
  },
  project: {
    code: null,
    name: null,
  },
  advance: {
    id: null,
  },
  policy: {
    amount: null,
    flag: null,
    state: 'SUCCESS',
  },
  new: {
    state: 'APPROVAL_PENDING',
  },
};
