export enum AccountStatus {
  UNINITIALIZED = 'UNINITIALIZED', // when a buyer in amex is not yet created
  PENDING = 'PENDING', // when a buyer in amex is created
  SUCCESS = 'SUCCESS', // when account's card enrollment is successful
  FAILED = 'FAILED', // when account's card enrollment failed
  DELETED = 'DELETED', // when account is unenrolled
}
