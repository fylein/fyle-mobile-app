export interface ReportStateMap {
  draft: {
    state: string[];
  };
  pending: {
    state: string[];
  };
  inquiry: {
    state: string[];
  };
  approved: {
    state: string[];
  };
  payment_queue: {
    state: string[];
  };
  paid: {
    state: string[];
  };
  edit: {
    state: string[];
  };
  all: {
    state: string[];
  };
}
