# API Contracts

### POST `/admin/expenses/unlink_card_transaction`

*Replaces:*

1.  [**Existing Public API**: POST `/api/transactions/unlink_card_expense`](https://www.notion.so/Existing-Public-API-POST-api-transactions-unlink_card_expense-2072ed8bfcb380cc8eccdd642549465f?pvs=21) 

*Payload:*

- 200
    
    ```json
    {
    	"data": {
    		"id": "txn12lk31j"
    	}
    }
    ```
    

*Response:*

- 200
    
    ```json
    {
    "data": {
        "user_created_expense": {
                "accounting_export_summary": {},
                "activity_details": null,
                "added_to_report_at": null,
                "admin_amount": 38.608,
                "advance_wallet_id": null,
                "amount": 38.608,
                "approvals": [],
                "approver_comments": [],
                "category": {
                    "code": null,
                    "display_name": "Unspecified",
                    "id": 263295,
                    "name": "Unspecified",
                    "sub_category": null,
                    "system_category": "Unspecified"
                },
                "category_id": 263295,
                "claim_amount": null,
                "code": null,
                "commute_deduction": null,
                "commute_details": null,
                "commute_details_id": null,
                "cost_center": null,
                "cost_center_id": null,
                "created_at": "2025-06-03T05:30:54.277746+00:00",
                "creator_user_id": "usrMqOYljdwr",
                "currency": "USD",
                "custom_fields": [],
                "custom_fields_flattened": {},
                "distance": null,
                "distance_unit": null,
                "employee": {
                    "business_unit": null,
                    "code": null,
                    "custom_fields": [],
                    "department": null,
                    "department_id": null,
                    "flattened_custom_field": {},
                    "has_accepted_invite": true,
                    "id": "ouMUiKFii75d",
                    "is_enabled": true,
                    "joined_at": null,
                    "level": null,
                    "location": null,
                    "mobile": null,
                    "org_id": "orgpOKkzxv1i",
                    "org_name": "USD org test visa",
                    "title": null,
                    "user": {
                        "email": "kulasekar.s@fyle.in",
                        "full_name": "Kula",
                        "id": "usrMqOYljdwr"
                    },
                    "user_id": "usrMqOYljdwr"
                },
                "employee_id": "ouMUiKFii75d",
                "ended_at": null,
                "expense_rule_data": null,
                "expense_rule_id": null,
                "extracted_data": null,
                "file_ids": [],
                "files": [],
                "foreign_amount": null,
                "foreign_currency": null,
                "hotel_is_breakfast_provided": null,
                "id": "txtVc4eo3ep3",
                "invoice_number": null,
                "is_billable": null,
                "is_corporate_card_transaction_auto_matched": false,
                "is_duplicate_present": true,
                "is_exported": null,
                "is_manually_flagged": null,
                "is_physical_bill_submitted": null,
                "is_policy_flagged": null,
                "is_receipt_mandatory": null,
                "is_reimbursable": false,
                "is_split": true,
                "is_verified": null,
                "last_exported_at": null,
                "last_settled_at": null,
                "last_verified_at": null,
                "locations": [],
                "matched_corporate_card_transaction_ids": [],
                "matched_corporate_card_transactions": [],
                "merchant": "WALMART.COM",
                "mileage_calculated_amount": null,
                "mileage_calculated_distance": null,
                "mileage_is_round_trip": null,
                "mileage_rate": null,
                "mileage_rate_id": null,
                "missing_mandatory_fields": {
                    "amount": false,
                    "currency": false,
                    "expense_field_ids": [],
                    "receipt": false
                },
                "org_id": "orgpOKkzxv1i",
                "per_diem_num_days": null,
                "per_diem_rate": null,
                "per_diem_rate_id": null,
                "physical_bill_submitted_at": null,
                "policy_amount": null,
                "policy_checks": {
                    "are_approvers_added": false,
                    "is_amount_limit_applied": false,
                    "is_flagged_ever": false,
                    "violations": null
                },
                "project": null,
                "project_id": null,
                "purpose": null,
                "report": null,
                "report_id": null,
                "report_last_approved_at": null,
                "report_last_paid_at": null,
                "seq_num": "E/2025/06/T/8",
                "source": "CORPORATE_CARD",
                "source_account": {
                    "id": "acc8fewkJPB2k",
                    "type": "PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT"
                },
                "source_account_id": "acc8fewkJPB2k",
                "spent_at": "2023-12-29T00:00:00+00:00",
                "split_group_amount": 96.52,
                "split_group_id": "tx5iI15G6Mre",
                "started_at": null,
                "state": "COMPLETE",
                "state_display_name": "Complete",
                "tax_amount": null,
                "tax_group": null,
                "tax_group_id": null,
                "travel_classes": [],
                "updated_at": "2025-06-03T05:30:54.277746+00:00",
                "user": {
                    "email": "kulasekar.s@fyle.in",
                    "full_name": "Kula kulaa",
                    "id": "usrMqOYljdwr"
                },
                "user_id": "usrMqOYljdwr",
                "verifications": [],
                "verifier_comments": []
            },
        "auto_created_expense": {
    	    // Expense Details
    		 }
        
        }
    ```
    

### POST `/spender/expenses/unlink_card_transaction`

*Replaces:*

1.  [**Existing Public API**: POST `/api/transactions/unlink_card_expense`](https://www.notion.so/Existing-Public-API-POST-api-transactions-unlink_card_expense-2072ed8bfcb380cc8eccdd642549465f?pvs=21) 

*Payload:*

- 200
    
    ```json
    {
    	"data": {
    		"expense_id": "txn12lk31j"
    	}
    }
    ```
    

*Response:*

- 200
    
    ```json
    {
    "data": {
        "user_created_expense": {
                "accounting_export_summary": {},
                "activity_details": null,
                "added_to_report_at": null,
                "admin_amount": 38.608,
                "advance_wallet_id": null,
                "amount": 38.608,
                "approvals": [],
                "approver_comments": [],
                "category": {
                    "code": null,
                    "display_name": "Unspecified",
                    "id": 263295,
                    "name": "Unspecified",
                    "sub_category": null,
                    "system_category": "Unspecified"
                },
                "category_id": 263295,
                "claim_amount": null,
                "code": null,
                "commute_deduction": null,
                "commute_details": null,
                "commute_details_id": null,
                "cost_center": null,
                "cost_center_id": null,
                "created_at": "2025-06-03T05:30:54.277746+00:00",
                "creator_user_id": "usrMqOYljdwr",
                "currency": "USD",
                "custom_fields": [],
                "custom_fields_flattened": {},
                "distance": null,
                "distance_unit": null,
                "employee": {
                    "business_unit": null,
                    "code": null,
                    "custom_fields": [],
                    "department": null,
                    "department_id": null,
                    "flattened_custom_field": {},
                    "has_accepted_invite": true,
                    "id": "ouMUiKFii75d",
                    "is_enabled": true,
                    "joined_at": null,
                    "level": null,
                    "location": null,
                    "mobile": null,
                    "org_id": "orgpOKkzxv1i",
                    "org_name": "USD org test visa",
                    "title": null,
                    "user": {
                        "email": "kulasekar.s@fyle.in",
                        "full_name": "Kula",
                        "id": "usrMqOYljdwr"
                    },
                    "user_id": "usrMqOYljdwr"
                },
                "employee_id": "ouMUiKFii75d",
                "ended_at": null,
                "expense_rule_data": null,
                "expense_rule_id": null,
                "extracted_data": null,
                "file_ids": [],
                "files": [],
                "foreign_amount": null,
                "foreign_currency": null,
                "hotel_is_breakfast_provided": null,
                "id": "txtVc4eo3ep3",
                "invoice_number": null,
                "is_billable": null,
                "is_corporate_card_transaction_auto_matched": false,
                "is_duplicate_present": true,
                "is_exported": null,
                "is_manually_flagged": null,
                "is_physical_bill_submitted": null,
                "is_policy_flagged": null,
                "is_receipt_mandatory": null,
                "is_reimbursable": false,
                "is_split": true,
                "is_verified": null,
                "last_exported_at": null,
                "last_settled_at": null,
                "last_verified_at": null,
                "locations": [],
                "matched_corporate_card_transaction_ids": [],
                "matched_corporate_card_transactions": [],
                "merchant": "WALMART.COM",
                "mileage_calculated_amount": null,
                "mileage_calculated_distance": null,
                "mileage_is_round_trip": null,
                "mileage_rate": null,
                "mileage_rate_id": null,
                "missing_mandatory_fields": {
                    "amount": false,
                    "currency": false,
                    "expense_field_ids": [],
                    "receipt": false
                },
                "org_id": "orgpOKkzxv1i",
                "per_diem_num_days": null,
                "per_diem_rate": null,
                "per_diem_rate_id": null,
                "physical_bill_submitted_at": null,
                "policy_amount": null,
                "policy_checks": {
                    "are_approvers_added": false,
                    "is_amount_limit_applied": false,
                    "is_flagged_ever": false,
                    "violations": null
                },
                "project": null,
                "project_id": null,
                "purpose": null,
                "report": null,
                "report_id": null,
                "report_last_approved_at": null,
                "report_last_paid_at": null,
                "seq_num": "E/2025/06/T/8",
                "source": "CORPORATE_CARD",
                "source_account": {
                    "id": "acc8fewkJPB2k",
                    "type": "PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT"
                },
                "source_account_id": "acc8fewkJPB2k",
                "spent_at": "2023-12-29T00:00:00+00:00",
                "split_group_amount": 96.52,
                "split_group_id": "tx5iI15G6Mre",
                "started_at": null,
                "state": "COMPLETE",
                "state_display_name": "Complete",
                "tax_amount": null,
                "tax_group": null,
                "tax_group_id": null,
                "travel_classes": [],
                "updated_at": "2025-06-03T05:30:54.277746+00:00",
                "user": {
                    "email": "kulasekar.s@fyle.in",
                    "full_name": "Kula kulaa",
                    "id": "usrMqOYljdwr"
                },
                "user_id": "usrMqOYljdwr",
                "verifications": [],
                "verifier_comments": []
            },
        "auto_created_expense": {
    	    // Expense Details
    		 }
        
        }
    ```
    

### POST `/approver/expenses/unlink_card_transaction`

*Replaces:*

1.  [**Existing Public API**: POST `/api/transactions/unlink_card_expense`](https://www.notion.so/Existing-Public-API-POST-api-transactions-unlink_card_expense-2072ed8bfcb380cc8eccdd642549465f?pvs=21) 

*Payload:*

- 200
    
    ```json
    {
    	"data": {
    		"expense_id": "txn12lk31j"
    	}
    }
    ```
    

*Response:*

- 200
    
    ```json
    {
    "data": {
        "user_created_expense": {
                "accounting_export_summary": {},
                "activity_details": null,
                "added_to_report_at": null,
                "admin_amount": 38.608,
                "advance_wallet_id": null,
                "amount": 38.608,
                "approvals": [],
                "approver_comments": [],
                "category": {
                    "code": null,
                    "display_name": "Unspecified",
                    "id": 263295,
                    "name": "Unspecified",
                    "sub_category": null,
                    "system_category": "Unspecified"
                },
                "category_id": 263295,
                "claim_amount": null,
                "code": null,
                "commute_deduction": null,
                "commute_details": null,
                "commute_details_id": null,
                "cost_center": null,
                "cost_center_id": null,
                "created_at": "2025-06-03T05:30:54.277746+00:00",
                "creator_user_id": "usrMqOYljdwr",
                "currency": "USD",
                "custom_fields": [],
                "custom_fields_flattened": {},
                "distance": null,
                "distance_unit": null,
                "employee": {
                    "business_unit": null,
                    "code": null,
                    "custom_fields": [],
                    "department": null,
                    "department_id": null,
                    "flattened_custom_field": {},
                    "has_accepted_invite": true,
                    "id": "ouMUiKFii75d",
                    "is_enabled": true,
                    "joined_at": null,
                    "level": null,
                    "location": null,
                    "mobile": null,
                    "org_id": "orgpOKkzxv1i",
                    "org_name": "USD org test visa",
                    "title": null,
                    "user": {
                        "email": "kulasekar.s@fyle.in",
                        "full_name": "Kula",
                        "id": "usrMqOYljdwr"
                    },
                    "user_id": "usrMqOYljdwr"
                },
                "employee_id": "ouMUiKFii75d",
                "ended_at": null,
                "expense_rule_data": null,
                "expense_rule_id": null,
                "extracted_data": null,
                "file_ids": [],
                "files": [],
                "foreign_amount": null,
                "foreign_currency": null,
                "hotel_is_breakfast_provided": null,
                "id": "txtVc4eo3ep3",
                "invoice_number": null,
                "is_billable": null,
                "is_corporate_card_transaction_auto_matched": false,
                "is_duplicate_present": true,
                "is_exported": null,
                "is_manually_flagged": null,
                "is_physical_bill_submitted": null,
                "is_policy_flagged": null,
                "is_receipt_mandatory": null,
                "is_reimbursable": false,
                "is_split": true,
                "is_verified": null,
                "last_exported_at": null,
                "last_settled_at": null,
                "last_verified_at": null,
                "locations": [],
                "matched_corporate_card_transaction_ids": [],
                "matched_corporate_card_transactions": [],
                "merchant": "WALMART.COM",
                "mileage_calculated_amount": null,
                "mileage_calculated_distance": null,
                "mileage_is_round_trip": null,
                "mileage_rate": null,
                "mileage_rate_id": null,
                "missing_mandatory_fields": {
                    "amount": false,
                    "currency": false,
                    "expense_field_ids": [],
                    "receipt": false
                },
                "org_id": "orgpOKkzxv1i",
                "per_diem_num_days": null,
                "per_diem_rate": null,
                "per_diem_rate_id": null,
                "physical_bill_submitted_at": null,
                "policy_amount": null,
                "policy_checks": {
                    "are_approvers_added": false,
                    "is_amount_limit_applied": false,
                    "is_flagged_ever": false,
                    "violations": null
                },
                "project": null,
                "project_id": null,
                "purpose": null,
                "report": null,
                "report_id": null,
                "report_last_approved_at": null,
                "report_last_paid_at": null,
                "seq_num": "E/2025/06/T/8",
                "source": "CORPORATE_CARD",
                "source_account": {
                    "id": "acc8fewkJPB2k",
                    "type": "PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT"
                },
                "source_account_id": "acc8fewkJPB2k",
                "spent_at": "2023-12-29T00:00:00+00:00",
                "split_group_amount": 96.52,
                "split_group_id": "tx5iI15G6Mre",
                "started_at": null,
                "state": "COMPLETE",
                "state_display_name": "Complete",
                "tax_amount": null,
                "tax_group": null,
                "tax_group_id": null,
                "travel_classes": [],
                "updated_at": "2025-06-03T05:30:54.277746+00:00",
                "user": {
                    "email": "kulasekar.s@fyle.in",
                    "full_name": "Kula kulaa",
                    "id": "usrMqOYljdwr"
                },
                "user_id": "usrMqOYljdwr",
                "verifications": [],
                "verifier_comments": []
            },
        "auto_created_expense": {
    	    // Expense Details
    		 }
        
        }
    ```