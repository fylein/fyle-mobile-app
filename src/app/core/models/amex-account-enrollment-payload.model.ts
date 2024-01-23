export interface AmexAccountEnrollmentPayload {
  business_name: string;
  phone: {
    country_code: string;
    number: string;
  };
  email_address: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
}
