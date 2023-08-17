import { ParsedResponse } from './parsed_response.model';

export interface InstaFyleImageData {
  exchangeRate?: number;
  thumbnail: string;
  type: string;
  url: string;
  parsedResponse?: { source?: string } | ParsedResponse;
}
