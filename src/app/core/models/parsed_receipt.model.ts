import { ParsedResponse } from './parsed_response.model';
export interface ParsedReceipt {
  data: ParsedResponse;
  exchangeRate?: number;
}
