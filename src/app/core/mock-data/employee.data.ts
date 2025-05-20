import deepFreeze from 'deep-freeze-strict';

import { Employee } from '../models/spender/employee.model';

export const selectedItem: Record<string, boolean> = deepFreeze({
  'ajain+12121212@fyle.in': true,
  'aaaaaaa@aaaabbbb.com': true,
  'aaaaasdjskjd@sdsd.com': true,
  'ajain+12+12+1@fyle.in': true,
  'kawaljeet.ravi22@gmail.com': true,
  'abcdefg@somemail.com': true,
});

export const selectedOptionRes: Partial<Employee> = deepFreeze({
  id: 'oubQzXeZbwbS',
  roles: '["FYLER","APPROVER","HOD","HOP","AUDITOR","FINANCE"]',
  is_enabled: true,
  has_accepted_invite: true,
  email: 'ajain+12+12+1@fyle.in',
  full_name: 'AA',
  user_id: 'usTdvbcxOqjs',
  is_selected: false,
});

export const filteredOptionsRes: Partial<Employee>[] = deepFreeze([
  {
    id: 'oubQzXeZbwbS',
    roles: '["FYLER","APPROVER","HOD","HOP","AUDITOR","FINANCE"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'ajain+12+12+1@fyle.in',
    full_name: 'AA',
    user_id: 'usTdvbcxOqjs',
    is_selected: true,
  },
  {
    id: 'oumDNNh9CfNY',
    roles: '["FYLER","FINANCE","ADMIN","APPROVER"]',
    is_enabled: true,
    has_accepted_invite: false,
    email: 'akarsh.k@fyle.in',
    full_name: 'Aastha',
    user_id: 'usqeLyJzMvjv',
    is_selected: false,
  },
  {
    id: 'ouPoW69slRBp',
    roles: '["FYLER","APPROVER","HOD","HOP","ADMIN","PAYMENT_PROCESSOR"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'aastha.b@fyle.in',
    full_name: 'Aastha B',
    user_id: 'usRjTPO4r69K',
    is_selected: false,
  },
  {
    id: 'ouE7qv3Y45oz',
    roles: '["FYLER","APPROVER","FINANCE","HOP"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'abcde@test.com',
    full_name: 'abcdd',
    user_id: 'usQx07v17BX5',
    is_selected: false,
  },
  {
    id: 'ouKmdituKMi9',
    roles: '["APPROVER","FYLER","AUDITOR","HOP","HOD","ADMIN"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'ajain+sp@fyle.in',
    full_name: 'Abhishek',
    user_id: 'usrLNunqplye',
    is_selected: false,
  },
  {
    id: 'ouTi8ul9u51y',
    roles: '["FYLER"]',
    is_enabled: true,
    has_accepted_invite: false,
    email: 'ajain+testing@fyle.in',
    full_name: 'Abhishek',
    user_id: 'usi3jriNhseA',
    is_selected: false,
  },
]);

export const filteredDataRes: Partial<Employee>[] = deepFreeze([
  {
    email: 'ajain+12121212@fyle.in',
    is_selected: true,
  },
  {
    email: 'aaaaaaa@aaaabbbb.com',
    is_selected: true,
  },
  {
    email: 'aaaaasdjskjd@sdsd.com',
    is_selected: true,
  },
  {
    email: 'kawaljeet.ravi22@gmail.com',
    is_selected: true,
  },
  {
    email: 'abcdefg@somemail.com',
    is_selected: true,
  },
]);

export const searchedUserListRes: Partial<Employee>[] = deepFreeze([
  {
    id: 'oubQzXeZbwbS',
    roles: '["FYLER","APPROVER","HOD","HOP"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'ajain+12+12+1@fyle.in',
    full_name: 'AA23',
    user_id: 'usTdvbcxOqjs',
    is_selected: true,
  },
  {
    id: 'ouXYHXfr4w0b',
    roles: '["FYLER","APPROVER","HOP"]',
    is_enabled: true,
    has_accepted_invite: false,
    email: 'aaaaaaa@aaaabbbb.com',
    full_name: 'AAA',
    user_id: 'usBBavu872gu',
    is_selected: true,
  },
  {
    id: 'ouX8dwsbLCLv',
    roles: '["FINANCE","ADMIN","APPROVER","FYLER","VERIFIER","PAYMENT_PROCESSOR","AUDITOR","HOP","HOD","OWNER"]',
    is_enabled: true,
    has_accepted_invite: true,
    email: 'ajain@fyle.in',
    full_name: 'Abhishek Jain',
    user_id: 'usvKA4X8Ugcr',
    is_selected: false,
  },
]);
