import deepFreeze from 'deep-freeze-strict';

export interface DwollaCustomer {
  id: string;
  created_at: Date;
  updated_at: Date;
  customer_id: string;
  customer_email: string;
  customer_added_by: string;
  customer_verified: boolean;
  beneficial_owner_added: boolean;
  beneficial_owner_verified: boolean;
  bank_account_added: boolean;
  bank_account_verified: boolean;
  bank_account_added_by: string;
  customer_document_needed: boolean;
  beneficial_owner_document_needed: boolean;
  customer_retry: boolean;
  customer_suspended: boolean;
  micro_deposit_verification_status: string;
  micro_deposit_verification_attempts: number;
  beneficial_owner_retry: boolean;
}

export const suspendedDwollaCustomer: DwollaCustomer = deepFreeze({
  id: 'test-id',
  created_at: new Date('2023-01-01T00:00:00.000Z'),
  updated_at: new Date('2023-01-02T00:00:00.000Z'),
  customer_id: 'test-customer-id',
  customer_email: 'test@test.com',
  customer_added_by: 'test-user',
  customer_verified: true,
  beneficial_owner_added: true,
  beneficial_owner_verified: true,
  bank_account_added: true,
  bank_account_verified: true,
  bank_account_added_by: 'test-user',
  customer_document_needed: false,
  beneficial_owner_document_needed: false,
  customer_retry: false,
  customer_suspended: true,
  micro_deposit_verification_status: 'verified',
  micro_deposit_verification_attempts: 0,
  beneficial_owner_retry: false,
});

export const activeDwollaCustomer: DwollaCustomer = deepFreeze({
  id: 'test-id',
  created_at: new Date('2023-01-01T00:00:00.000Z'),
  updated_at: new Date('2023-01-02T00:00:00.000Z'),
  customer_id: 'test-customer-id',
  customer_email: 'test@test.com',
  customer_added_by: 'test-user',
  customer_verified: true,
  beneficial_owner_added: true,
  beneficial_owner_verified: true,
  bank_account_added: true,
  bank_account_verified: true,
  bank_account_added_by: 'test-user',
  customer_document_needed: false,
  beneficial_owner_document_needed: false,
  customer_retry: false,
  customer_suspended: false,
  micro_deposit_verification_status: 'verified',
  micro_deposit_verification_attempts: 0,
  beneficial_owner_retry: false,
});
