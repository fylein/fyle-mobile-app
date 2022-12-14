export interface MileageDetails {
  unit: string;
  fiscal_year_start_date: string;
  fiscal_year_end_date: string;
  two_wheeler: number;
  four_wheeler: number;
  four_wheeler1: number;
  four_wheeler3: number;
  four_wheeler4: number;
  bicycle: number;
  electric_car: number;
  two_wheeler_slabbed_rate: number;
  four_wheeler_slabbed_rate: number;
  four_wheeler1_slabbed_rate: number;
  four_wheeler3_slabbed_rate: number;
  four_wheeler4_slabbed_rate: number;
  bicycle_slabbed_rate: number;
  electric_car_slabbed_rate: number;
  two_wheeler_distance_limit: number;
  four_wheeler_distance_limit: number;
  four_wheeler1_distance_limit: number;
  four_wheeler3_distance_limit: number;
  four_wheeler4_distance_limit: number;
  bicycle_distance_limit: number;
  electric_car_distance_limit: number;
  location_mandatory: boolean;
  enable_individual_mileage_rates: boolean;

  allowed?: boolean;
  enabled?: boolean;
}
