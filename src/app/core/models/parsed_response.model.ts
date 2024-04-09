import { Destination } from './destination.model';

export interface ParsedResponse {
  category?: string;
  currency?: string;
  amount?: number;
  date?: Date;
  location?: Destination;
  invoice_dt?: Date;
  vendor_name?: string;
}
