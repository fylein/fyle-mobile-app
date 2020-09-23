import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { tap, filter, map, switchMap } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(
    private authService: AuthService
  ) { }

  // can check roleActionMap[role]['company']['view'] for whether he is allowed company view.
  // transportation, hotel keys are only for list pages, not for any create and edit page, need to fix later
  roleActionMap = {
    owner: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: true,
        bill_verification: true,
        remind: true,
        split: false,
        delete: false,
        report: true,
        assign: true,
        edit: false,
        super_edit: true,
        verify: true,
        export: true,
        audit: false
      },
      reports: {
        delete: false,
        resubmit: false,
        create: false,
        view: true,
        approve: false,
        super_approve: true,
        send_back: true,
        remind: true,
        verify: true,
        payment_queue: true,
        remove_payment_queue: true,
        export: true,
        export_accounting: true,
        share: false,
        add_approver: true,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        process_request: true,
        issue: true,
        export: true,
        export_accounting: true,
        refund: true,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: true,
        match: true,
        assign: true,
        export: true,
        delete: true
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: true,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: true,
        reject_cancellation: true,
        assign: true,
        create_expense: true,
        audit: false
      },
      transportation: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: true
      },
      hotel: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: true
      },
      mis_reporting: {
        view: true
      },
      analytics: {
        view: true
      },
      employees: {
        view: true,
        add: true,
        edit: true,
        disable: true,
        export: true,
        invite: true
      },
      settings: {
        view: true,
        edit: true,
        create_org: true,
        policy_rules: true,
        accounting: true
      },
      accounting: {
        exports: true
      },
      integration_exports: {
        exports: true
      },
      payments: {
        view: true,
        start_processing: true,
        remove_payment_queue: true,
        mark_paid: true,
        remove_processing: true,
        export: true,
        export_accounting: true,
        audit: false,
        view_advances: true
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: true,
        cost_center: true
      },
      recurrences: {
        view: false
      }
    },
    admin: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: true,
        bill_verification: true,
        remind: true,
        split: false,
        delete: false,
        report: true,
        assign: true,
        edit: false,
        super_edit: true,
        verify: true,
        export: true,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: true,
        send_back: true,
        remind: true,
        verify: true,
        payment_queue: true,
        remove_payment_queue: true,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: true,
        add_approver: true,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        process_request: true,
        issue: true,
        export: true,
        export_accounting: true,
        refund: true,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: true,
        match: true,
        assign: true,
        export: true,
        delete: true
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: true,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: true,
        reject_cancellation: true,
        assign: true,
        create_expense: true,
        audit: false
      },
      transportation: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: true
      },
      hotel: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: true
      },
      mis_reporting: {
        view: true
      },
      analytics: {
        view: true
      },
      employees: {
        view: true,
        add: true,
        edit: true,
        disable: true,
        export: true,
        invite: true
      },
      settings: {
        view: true,
        edit: true,
        create_org: true,
        policy_rules: true,
        accounting: true
      },
      accounting: {
        exports: true
      },
      integration_exports: {
        exports: true
      },
      payments: {
        view: true,
        start_processing: true,
        remove_payment_queue: true,
        mark_paid: true,
        remove_processing: true,
        export: true,
        export_accounting: true,
        audit: false,
        view_advances: true
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: true,
        cost_center: true
      },
      recurrences: {
        view: false
      }
    },
    finance: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: true,
        bill_verification: true,
        remind: true,
        split: false,
        delete: false,
        report: true,
        assign: true,
        edit: false,
        super_edit: true,
        verify: true,
        export: true,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: true,
        send_back: true,
        remind: true,
        verify: true,
        payment_queue: true,
        remove_payment_queue: true,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: true,
        add_approver: true,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        process_request: true,
        issue: true,
        export: true,
        export_accounting: true,
        refund: true,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: true,
        match: true,
        assign: true,
        export: true,
        delete: true
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: true,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: true,
        reject_cancellation: true,
        assign: true,
        create_expense: true,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: true
      },
      analytics: {
        view: true
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: true,
        accounting: false
      },
      accounting: {
        exports: true
      },
      integration_exports: {
        exports: true
      },
      payments: {
        view: true,
        start_processing: true,
        remove_payment_queue: true,
        mark_paid: true,
        remove_processing: true,
        export: true,
        export_accounting: true,
        audit: false,
        view_advances: true
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    fyler: {
      expenses: {
        create: true,
        bulkCreate: true,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: true,
        delete: true,
        report: true,
        assign: false,
        edit: true,
        super_edit: false,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: true,
        edit: true,
        resubmit: true,
        create: true,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: true,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: true,
        export_accounting: false,
        share: true,
        round_off_amount: false,
        add_approver: true,
        audit: false,
        review: false
      },
      advances: {
        request: true,
        delete: true,
        view: true,
        edit: true,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: false,
        match: true,
        assign: false,
        export: true,
        delete: false
      },
      receipts: {
        upload: true,
        match: true,
        delete: true
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: true,
        create: true,
        cancel: true,
        edit: true,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: true,
        request_cancellation: true,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: true,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: true,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: true,
        upload: true,
        match: true
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: true
      }
    },
    approver: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: true,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: true,
        super_approve: false,
        send_back: true,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: false,
        add_approver: true,
        audit: false,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: { // approver
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: true,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false,
        team: true
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: true,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    transcriber: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: false,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: false,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: false,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: false,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: false,
        export_accounting: false,
        share: false,
        round_off_amount: false,
        add_approver: false,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: false,
        audit: false,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: false,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: true,
        add: true,
        edit: true,
        delete: true
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    travel_admin: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: false,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: false,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: false,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: false,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: false,
        export_accounting: false,
        share: false,
        round_off_amount: false,
        add_approver: false,
        audit: false,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: false,
        audit: false,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: true,
        create_expense: true,
        audit: false
      },
      transportation: {
        view: true,
        assign: true,
        book: true,
        cancel: true,
        ask_questions: true
      },
      hotel: {
        view: true,
        assign: true,
        book: true,
        cancel: true,
        ask_questions: true
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    travel_agent: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: false,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: false,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: false,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: false,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: false,
        export_accounting: false,
        share: false,
        round_off_amount: false,
        add_approver: false,
        audit: false,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: false,
        audit: false,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: false,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: true,
        create_expense: true,
        audit: false
      },
      transportation: {
        view: true,
        assign: true,
        book: true,
        cancel: true,
        ask_questions: true
      },
      hotel: {
        view: true,
        assign: true,
        book: true,
        cancel: true,
        ask_questions: true
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    verifier: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: true,
        bill_verification: true,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: true,
        verify: true,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: true,
        remind: false,
        verify: true,
        payment_queue: false,
        remove_payment_queue: false,
        export: false,
        export_accounting: false,
        share: false,
        round_off_amount: true,
        add_approver: false,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: false,
        audit: false,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: false,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    payment_processor: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: false,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: false,
        remind: false,
        verify: false,
        payment_queue: true,
        remove_payment_queue: true,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: true,
        add_approver: false,
        audit: false,
        review: true
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: false,
        super_approve: true,
        send_back: true,
        process_request: true,
        issue: true,
        export: true,
        export_accounting: true,
        refund: true,
        add_approver: false,
        audit: false,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: true,
        start_processing: true,
        remove_payment_queue: true,
        mark_paid: true,
        remove_processing: true,
        export: true,
        export_accounting: true,
        audit: false,
        view_advances: true
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    auditor: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: false,
        verify: false,
        export: true,
        audit: true
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: false,
        super_approve: false,
        send_back: false,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: true,
        export_accounting: false,
        share: false,
        round_off_amount: false,
        add_approver: false,
        audit: true,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        process_request: false,
        issue: false,
        export: true,
        export_accounting: false,
        refund: false,
        add_approver: false,
        audit: true,
        view_requests: false
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: false,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: false,
        approve: false,
        super_approve: false,
        send_back: false,
        add_approver: false,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: true
      },
      transportation: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: true,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: false,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: true,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: true,
        export_accounting: false,
        audit: true,
        view_advances: true
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    hod: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: true,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: true,
        super_approve: false,
        send_back: true,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: false,
        add_approver: true,
        audit: false,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: true,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false,
        team: true
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: true,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    },
    hop: {
      expenses: {
        create: false,
        bulkCreate: false,
        view: true,
        flag: false,
        bill_verification: false,
        remind: false,
        split: false,
        delete: false,
        report: false,
        assign: false,
        edit: false,
        super_edit: true,
        verify: false,
        export: false,
        audit: false
      },
      reports: {
        delete: false,
        edit: false,
        resubmit: false,
        create: false,
        view: true,
        beta_view: true,
        approve: true,
        super_approve: false,
        send_back: true,
        remind: false,
        verify: false,
        payment_queue: false,
        remove_payment_queue: false,
        export: true,
        export_accounting: true,
        share: false,
        round_off_amount: false,
        add_approver: true,
        audit: false,
        review: false
      },
      advances: {
        request: false,
        delete: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        process_request: false,
        issue: false,
        export: false,
        export_accounting: false,
        refund: false,
        add_approver: true,
        audit: false,
        view_requests: true
      },
      ccc: {
        upload: false,
        match: false,
        assign: false,
        export: false,
        delete: false
      },
      receipts: {
        upload: false,
        match: false,
        delete: false
      },
      summary: {
        team: true,
        company: false,
      },
      trips: {
        view: true,
        create: false,
        cancel: false,
        edit: false,
        super_edit: true,
        approve: true,
        super_approve: false,
        send_back: true,
        add_approver: true,
        request_cancellation: false,
        approve_cancellation: false,
        reject_cancellation: false,
        assign: false,
        create_expense: false,
        audit: false
      },
      transportation: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      hotel: {
        view: false,
        assign: false,
        book: false,
        cancel: false,
        ask_questions: false
      },
      mis_reporting: {
        view: false
      },
      analytics: {
        view: false,
        team: true
      },
      employees: {
        view: false,
        add: false,
        edit: false,
        disable: false,
        export: false,
        invite: false
      },
      settings: {
        view: false,
        edit: false,
        create_org: false,
        policy_rules: true,
        accounting: false
      },
      accounting: {
        exports: false
      },
      integration_exports: {
        exports: false
      },
      payments: {
        view: false,
        start_processing: false,
        remove_payment_queue: false,
        mark_paid: false,
        remove_processing: false,
        export: false,
        export_accounting: false,
        audit: false,
        view_advances: false
      },
      transcription: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      personal_cards: {
        view: false,
        upload: false,
        match: false
      },
      vendors: {
        view: false,
        add: false,
        edit: false,
        delete: false
      },
      bulk_upload: {
        category: false,
        cost_center: false
      },
      recurrences: {
        view: false
      }
    }
  };

  allowedActions(resource, actions, orgSettings) {
    const roles$ = this.authService.getRoles();
    const allowedActions: any = {
      allowedRouteAccess: false
    };

    const filteredRoles$ = roles$.pipe(
      map(roles => {
        if (roles.indexOf('SUPER_ADMIN') > -1) {
          roles.splice(roles.indexOf('SUPER_ADMIN'), 1);
        }

        return roles;
      })
    );

    return filteredRoles$.pipe(
      map(
        filteredRoles => {
          try{
            if (this.allowedAccess(resource, orgSettings)) {
            for (const currentRole of filteredRoles) {
              const role = currentRole.toLowerCase();
              for (const action of actions) {
                if (!allowedActions.hasOwnProperty(action) || !allowedActions[action]) {
                  allowedActions[action] = this.roleActionMap[role][resource][action];
                  if (allowedActions[action]) {
                    allowedActions.allowedRouteAccess = true;
                  }
                }
              }
            }
          }
          return allowedActions;
         } catch (err){
           console.log(err)
         }
          
          
        }
      ),
      tap(console.log),
      switchMap(
        currentAllowedActions => {
          if (currentAllowedActions.allowedRouteAccess) {
            return of(currentAllowedActions);
          } else {
            throwError('no route access');
          }
        }
      )
    );
  }


  allowedAccess(resource, orgSettings) {
    let allowed = true;

    if (resource === 'advances') {
      allowed = orgSettings.advance_requests.enabled || orgSettings.advances.enabled;
    } else if (resource === 'trips') {
      allowed = orgSettings.trip_requests.enabled;
    }

    return allowed;
  }

  isTravelAdmin() {
    const roles$ = this.authService.getRoles();
    return roles$.pipe(
      map(roles => (roles.indexOf('TRAVEL_ADMIN') > -1) && (roles.indexOf('ADMIN') === -1) && (roles.indexOf('FINANCE') === -1))
    );
  }

  isTravelAgent() {
    const roles$ = this.authService.getRoles();
    return roles$.pipe(
      map(roles => (roles.indexOf('TRAVEL_AGENT') > -1) && (roles.indexOf('ADMIN') === -1) && (roles.indexOf('FINANCE') === -1))
    );
  }

  isAuditor() {
    const roles$ = this.authService.getRoles();
    return roles$.pipe(
      map(roles => (roles.indexOf('AUDITOR') > -1) && (roles.indexOf('ADMIN') === -1) && (roles.indexOf('FINANCE') === -1))
    );
  }
}
