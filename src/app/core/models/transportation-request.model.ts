import { Destination } from './destination.model';
import { CustomField } from './custom_field.model';

export interface ExtendedTransportationRequest {
  requestor: {
    department_id: string;
  };
  tb: {
    booked_at: Date;
    booked_by: string;
    booked_by_email: string;
    booked_by_name: string;
    booking_number: string
    booking_reference_id: string;
    cancellation_requested: boolean;
    cancellation_requested_at: Date;
    currency: string;
    id: string;
    net_amount: number;
    notes: string;
    num_boarding_pass_files: number;
    source: string;
    transaction_id: string;
    transaction_number: string;
  };
  tc: {
    cancellation_amount: number;
    cancellation_number: string;
    cancellation_reference_id: string;
    cancelled_at: Date;
    cancelled_by: string;
    currency: string;
    id: string
    notes: string
    source: string
    transaction_id: string;
  };
  tr: {
    amount: number;
    assigned_to: string;
    assigned_to_email: string;
    assigned_to_name: string;
    created_at: Date;
    currency: string;
    custom_field_values: CustomField[];
    from_city: Destination;
    id: string;
    need_booking: boolean;
    notes: string;
    onward_at: Date;
    onward_dt: Date;
    org_user_id: string;
    preferred_timing: string;
    request_number: string;
    requested_by_email: string;
    requested_by_name: string;
    source: string;
    to_city: Destination;
    transport_mode: string
    trip_request_id: string;
    trip_request_number: string;
  };
  trp: {
    project_id: string;
  };
  custom_field_values?: CustomField[];
  internalState?: string;
  internalStateDisplayName?: string;
}
