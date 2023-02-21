import { PlatformPolicyExpense } from '../models/platform/platform-policy-expense.model';

// export const platformPolicyServiceData: PlatformPolicyExpense = {
//     merchant: "test",
//     spent_at: new Date("2023-02-21T06:30:00.000Z"),
//     foreign_currency: null,
//     foreign_amount: null,
//     claim_amount: 4000,
//     purpose: "Testing Policy Service",
//     cost_center_id: 4736,
//     category_id: 53107,
//     project_id: 3898,
//     source_account_id: "accKjESAsqQcR",
//     tax_amount: null,
//     is_reimbursable: true,
//     distance: null,
//     distance_unit: null,
//     locations: [],
//     custom_fields: [
//         {
//             id: 174083,
//             mandatory: false,
//             name: "userlist test",
//             options: [],
//             placeholder: "userlist test",
//             prefix: "",
//             type: "USER_LIST",
//             value: []
//         },
//         {
//             id: 210078,
//             mandatory: false,
//             name: "tettest",
//             options: [],
//             placeholder: "testtet",
//             prefix: "",
//             type: "TEXT",
//             value: null
//         },
//         {
//             id: 218778,
//             mandatory: false,
//             name: "select type field",
//             options: [
//                 {
//                     label: "select-1",
//                     value: "select-1"
//                 },
//                 {
//                     label: "select-2",
//                     value: "select-2"
//                 }
//             ],
//             placeholder: "select custom field",
//             prefix: "",
//             type: "SELECT",
//             value: ""
//         }
//     ],
//     started_at: null,
//     ended_at: null,
//     num_files: 0,
//     is_matching_ccc: false,
//     travel_classes: []
// };

export const platformPolicyServiceData: PlatformPolicyExpense = {
  merchant: '',
  spent_at: new Date('2023-02-21T06:30:00.000Z'),
  foreign_currency: null,
  foreign_amount: null,
  claim_amount: 20453.73,
  purpose: 'Test',
  cost_center_id: 4736,
  category_id: 113717,
  project_id: 3898,
  source_account_id: 'acc1Wy9lM0dHV',
  is_reimbursable: true,
  distance: 619.81,
  distance_unit: 'MILES',
  locations: [
    {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      formatted_address:
        'Shop No:8, Sahar Cargo, Andheri Victor Mati Lane, Sahar Rd, Tank View, Sahar Village, Andheri East, Mumbai, Maharashtra 400099, India',
      latitude: 19.098039,
      longitude: 72.867626,
      display_name:
        'Bangalore Airport Terminal Services Private Limited, Sahar Road, Tank View, Sahar Village, Andheri East, Mumbai, Maharashtra, India',
    },
    // {
    //     city: "Bengaluru",
    //     state: "Karnataka",
    //     country: "India",
    //     formatted_address: "Test, St Thomas Town, Ramaiah Layout, Kacharakanahalli, Bengaluru, Karnataka 560043, India",
    //     latitude: 13.0175303,
    //     longitude: 77.633241,
    //     display_name: "Test, Saint Thomas Town, Ramaiah Layout, Kacharakanahalli, Bengaluru, Karnataka, India"
    // }
  ],
  custom_fields: [
    {
      id: 174083,
      mandatory: false,
      name: 'userlist test',
      options: [],
      placeholder: 'userlist test',
      prefix: '',
      type: 'USER_LIST',
      value: null,
    },
    {
      id: 218778,
      mandatory: false,
      name: 'select type field',
      options: [
        {
          label: 'select-1',
          value: 'select-1',
        },
        {
          label: 'select-2',
          value: 'select-2',
        },
      ],
      placeholder: 'select custom field',
      prefix: '',
      type: 'SELECT',
      value: 'select-1',
    },
  ],
  id: '1234',
  mileage_rate_id: 24329,
  mileage_calculated_distance: 619.81,
  mileage_calculated_amount: 20453.73,
  travel_classes: [],
  tax_amount: 0,
  tax_group_id: '',
  is_billable: false,
  started_at: undefined,
  ended_at: undefined,
  per_diem_rate_id: 0,
  per_diem_num_days: 0,
  num_files: 0,
  is_matching_ccc: false,
};

// export const expectedPlatformPolicyExpense: PlatformPolicyExpense = {
//     id: null,
//     spent_at: null,
//     merchant: null,
//     foreign_currency: null,
//     foreign_amount: null,
//     claim_amount: null,
//     purpose: null,
//     cost_center_id: null,
//     category_id: null,
//     project_id: null,
//     source_account_id: null,
//     tax_amount: null,
//     tax_group_id: null,
//     is_billable: null,
//     is_reimbursable: null,
//     distance: null,
//     distance_unit: null,
//     locations: [],
//     custom_fields: null,
//     started_at: null,
//     ended_at: null,
//     per_diem_rate_id: null,
//     per_diem_num_days: null,
//     num_files: null,
//     is_matching_ccc: null,
//     mileage_rate_id: null,
//     mileage_calculated_distance: null,
//     mileage_calculated_amount: null,
//     travel_classes: [],
//   };
