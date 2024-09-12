export interface PersonalCardsDateParams {
  pageNumber: number;
  queryParams: {
    ba_id?: string;
    btxn_status?: string;
    or?: string;
  };
  sortParam: string;
  sortDir: string;
  searchString: string;
}
