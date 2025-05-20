export interface ExpenseProperties {
  Type: string;
  Amount: number;
  Currency: string;
  Category: string;
  Time_Spent: string;
  Used_Autofilled_Category?: boolean;
  Used_Autofilled_Project: boolean;
  Used_Autofilled_CostCenter: boolean;
  Used_Autofilled_Currency?: boolean;
  Instafyle?: boolean;
  Used_Autofilled_VehicleType?: boolean;
  Used_Autofilled_StartLocation?: boolean;
}
