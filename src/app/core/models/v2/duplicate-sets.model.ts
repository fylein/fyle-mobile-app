export interface DuplicateSet {
  fields?: string[]; // in platform, fields aren't present -> so making it optional
  transaction_ids: string[];
}
