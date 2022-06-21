export interface FormattedPolicyViolation {
  rules: string[];
  action: string;
  type: string;
  name: string;
  currency: string;
  amount: number;
  isCriticalPolicyViolation: boolean;
  isExpanded: boolean;
}
