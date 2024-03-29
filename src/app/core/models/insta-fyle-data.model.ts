import { ParsedResponse } from './parsed_response.model';

export interface InstaFyleResponse {
  error?: InstaFyleResponse | boolean;
  exchangeRate?: number;
  thumbnail: string;
  type: string;
  url: string;
  parsedResponse?: ParsedResponse;
}
