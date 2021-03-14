import { Destination } from './destination.model';
import { CustomField } from './custom_field.model';

export interface ExtendedHotelRequest {
  hb: {
    booked_at: Date;
    booked_by: string;
    booked_by_email: string;
    booked_by_name: string;
    booking_number: string;
    booking_reference_id: string;
    cancellation_requested: boolean;
    cancellation_requested_at: Date;
    currency: string;
    id: string;
    net_amount: number;
    notes: string;
    source: string;
    transaction_id: string;
    transaction_number: string;
  };
  hc: {
    cancellation_amount: number;
    cancellation_number: string;
    cancellation_reference_id: string;
    cancelled_at: Date;
    cancelled_by: string;
    currency: string;
    id: string;
    notes: string;
    source: string;
    transaction_id: string;
  };
  hr: {
    amount: number;
    assigned_to: string;
    assigned_to_email: string;
    assigned_to_name: string;
    check_in_at: Date;
    check_in_dt: Date;
    check_out_at: Date;
    check_out_dt: Date;
    city: Destination;
    created_at: Date;
    currency: string;
    custom_field_values: CustomField[];
    id: string;
    location: Destination;
    need_booking: boolean;
    notes: string;
    org_user_id: string;
    request_number: string;
    requested_by_email: string;
    requested_by_name: string;
    rooms: number;
    source: string;
    trip_request_id: string;
    trip_request_number: string;
  };
  requestor: {
    department_id: string;
  };
  trp: {
    project_id: string;
  };
}
