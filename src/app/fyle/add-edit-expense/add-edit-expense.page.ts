import { Component, OnInit, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Observable, of, iif, forkJoin, from, combineLatest, throwError, noop, concat } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  concatMap, switchMap, map, startWith, shareReplay,
  distinctUntilChanged, take, tap, finalize, filter, debounceTime, catchError, reduce
} from 'rxjs/operators';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, ValidationErrors, AbstractControl } from '@angular/forms';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { TransactionFieldConfigurationsService } from 'src/app/core/services/transaction-field-configurations.service';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { isEqual, cloneDeep, isNumber } from 'lodash';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DuplicateDetectionService } from 'src/app/core/services/duplicate-detection.service';
import * as _ from 'lodash';
import { SplitExpensePopoverComponent } from './split-expense-popover/split-expense-popover.component';
import { ModalController, PopoverController, NavController } from '@ionic/angular';
import { CriticalPolicyViolationComponent } from './critical-policy-violation/critical-policy-violation.component';
import { PolicyViolationComponent } from './policy-violation/policy-violation.component';
import { StatusService } from 'src/app/core/services/status.service';
import { FileService } from 'src/app/core/services/file.service';
import { CameraOptionsPopupComponent } from './camera-options-popup/camera-options-popup.component';
import { ViewAttachmentsComponent } from './view-attachments/view-attachments.component';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';

@Component({
  selector: 'app-add-edit-expense',
  templateUrl: './add-edit-expense.page.html',
  styleUrls: ['./add-edit-expense.page.scss'],
})
export class AddEditExpensePage implements OnInit {
  etxn$: Observable<any>;
  paymentModes$: Observable<any[]>;
  pickRecentCurrency$: Observable<any>;
  isCreatedFromCCC = false; // TODO: Verify naming
  paymentAccount$: Observable<any>;
  isCCCAccountSelected$: Observable<boolean>;
  homeCurrency$: Observable<string>;
  mode: string;
  title: string;
  activeIndex: number;
  reviewList: string[];
  fg: FormGroup;
  filteredCategories$: Observable<any[]>;
  minDate: string;
  maxDate: string;
  txnFields$: Observable<any>;
  taxSettings$: Observable<any>;
  reports$: Observable<any>;
  isProjectsEnabled$: Observable<boolean>;
  flightJourneyTravelClassOptions$: Observable<any>;
  customInputs$: Observable<any>;
  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;
  selectedCCCTransaction;
  isOffline = false;
  canChangeMatchingCCCTransaction = true;
  transactionInReport$: Observable<boolean>;
  transactionMandatoyFields$: Observable<any>;
  isCriticalPolicyViolated = false;
  showSelectedTransaction = false;
  isIndividualProjectsEnabled$: Observable<boolean>;
  individualProjectIds$: Observable<[]>;
  isNotReimbursable$: Observable<boolean>;
  costCenters$: Observable<any[]>;
  receiptsData: any;
  duplicates$: Observable<any>;
  duplicateBoxOpen = false;
  isAmountCapped$: Observable<boolean>;
  isAmountDisabled$: Observable<boolean>;
  isCriticalPolicyViolated$: Observable<boolean>;
  isSplitExpenseAllowed$: Observable<boolean>;
  attachmentUploadInProgress = false;
  attachedReceiptsCount = 0;
  instaFyleCancelled = false;
  newExpenseDataUrls = [];
  focusState = false;
  isConnected$: Observable<boolean>;
  invalidPaymentMode: boolean = false;
  pointToDuplicates = false;

  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;

  constructor(
    private activatedRoute: ActivatedRoute,
    private accountsService: AccountsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private projectService: ProjectsService,
    private reportService: ReportService,
    private transactionFieldConfigurationService: TransactionFieldConfigurationsService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private transactionService: TransactionService,
    private dataTransformService: DataTransformService,
    private policyService: PolicyService,
    private transactionOutboxService: TransactionsOutboxService,
    private router: Router,
    private duplicateDetectionService: DuplicateDetectionService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private statusService: StatusService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private currencyService: CurrencyService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController
  ) { }

  goBack() {
    if (this.mode === 'add') {
      this.router.navigate(['/', 'enterprise', 'my_expenses']);
    } else {
      if (!this.reviewList || this.reviewList.length === 0) {
        this.navController.back();
      } else if (this.reviewList && this.activeIndex < this.reviewList.length) {
        if (+this.activeIndex === 0) {
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
        } else {
          this.goToPrev();
        }
      } else {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    }
  };

  merchantValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.display_name) {
      return c.value.display_name.length > 250 ? { merchantNameSize: 'Length is greater than 250' } : null;
    }
    return null;
  }

  currencyObjValidator(c: FormControl): ValidationErrors {
    if (c.value && c.value.amount && c.value.currency) {
      return null;
    }
    return {
      required: false
    };
  }

  setUpTaxCalculations() {
    combineLatest(this.fg.controls.currencyObj.valueChanges, this.fg.controls.tax.valueChanges).subscribe(() => {
      if (this.fg.controls.tax.value && this.fg.controls.tax.value.percentage && this.fg.controls.currencyObj.value) {
        this.fg.controls.taxValue.setValue(
          this.fg.controls.tax.value.percentage *
          (this.fg.controls.currencyObj.value.orig_amount || this.fg.controls.currencyObj.value.amount));
      }
    });
  }

  canGetDuplicates() {
    return this.offlineService.getOrgSettings().pipe(
      map(orgSettings => {
        const isAmountCurrencyTxnDtPresent =
          isNumber(this.fg.value.currencyObj && this.fg.value.currencyObj.amount) && !!this.fg.value.dateOfSpend
          && !!(this.fg.value.currencyObj && this.fg.value.currencyObj.currency);
        return this.fg.valid && orgSettings.policies.duplicate_detection_enabled && isAmountCurrencyTxnDtPresent;
      })
    );
  }

  checkForDuplicates() {
    return this.canGetDuplicates().pipe(
      switchMap((canGetDuplicates) => {
        const customFields$ = this.getCustomFields();
        return iif(
          () => canGetDuplicates,
          this.generateEtxnFromFg(this.etxn$, customFields$).pipe(
            switchMap(etxn => this.duplicateDetectionService.getPossibleDuplicates(etxn.tx))
          ),
          of(null)
        );
      })
    );
  }

  getDuplicates() {
    return this.etxn$.pipe(
      switchMap(etxn => {
        return this.duplicateDetectionService.getDuplicates(etxn.tx.id);
      })
    );
  }

  checkIfInvalidPaymentMode() {
    return this.etxn$.pipe(
      map(etxn => {
        const paymentAccount = this.fg.value.paymentMode;
        const originalSourceAccountId = etxn && etxn.tx && etxn.tx.source_account_id;
        let isPaymentModeInvalid = false;
        if (paymentAccount && paymentAccount.acc && paymentAccount.acc.type === 'PERSONAL_ADVANCE_ACCOUNT') {
          if (paymentAccount.acc.id !== originalSourceAccountId) {
            isPaymentModeInvalid = paymentAccount.acc.tentative_balance_amount < (this.fg.value.currencyObj && this.fg.value.currencyObj.amount);
          } else {
            isPaymentModeInvalid = (paymentAccount.acc.tentative_balance_amount + etxn.tx.amount) < (this.fg.value.currencyObj && this.fg.value.currencyObj.amount);
          }
        }
        return isPaymentModeInvalid;
      })
    );
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable()).pipe(shareReplay(1));
  }

  getPossibleDuplicates() {
    const currentTxn$ = this.generateEtxnFromFg(this.etxn$, this.getCustomFields());
    const isSameTxn$ = forkJoin({
      oldTxn: this.etxn$,
      currentTxn: currentTxn$
    }).pipe(
      map(({ oldTxn, currentTxn }) => {
        const oldTxnClone = cloneDeep(oldTxn);
        const currentTxnClone = cloneDeep(currentTxn);
        // safe hack - can clean off later on
        oldTxnClone.tx.custom_properties = null;
        currentTxnClone.tx.custom_properties = null;
        oldTxnClone.tx.locations = null;
        currentTxnClone.tx.locations = null;
        oldTxnClone.tx.txn_dt = oldTxnClone.tx.txn_dt && moment(oldTxnClone.tx.txn_dt).format('y-MM-DD');
        currentTxnClone.tx.txn_dt = currentTxnClone.tx.txn_dt && moment(currentTxnClone.tx.txn_dt).format('y-MM-DD');

        return isEqual(oldTxnClone.tx, currentTxnClone.tx);
      })
    );

    // TODO: Verify with policy team - getDuplicates never executes in old mobile app
    // return isSameTxn$.pipe(
    //   switchMap((isSameTxn) => {
    //     return iif(() => isSameTxn, this.getDuplicates(), this.checkForDuplicates());
    //   })
    // );

    return this.checkForDuplicates();
  }

  setupDuplicateDetection() {
    this.duplicates$ = this.fg.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(() => {
        return this.getPossibleDuplicates();
      })
    );

    this.duplicates$.pipe(
      filter(duplicates => duplicates && duplicates.length),
      take(1)
    ).subscribe((res) => {
      this.pointToDuplicates = true;
      setTimeout(()=> {
        this.pointToDuplicates = false;
      }, 3000);
    });
  }

  showDuplicates() {
    const duplicateInputContainer = this.duplicateInputContainer.nativeElement as HTMLElement;
    if (duplicateInputContainer) {
      duplicateInputContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest', 
        inline: 'start'
      });

      this.pointToDuplicates = false;
    }
  }

  openSplitExpenseModal(splitType) {
    const customFields$ = this.getCustomFields();

    this.generateEtxnFromFg(this.etxn$, customFields$).subscribe(res => {
      this.router.navigate(['/', 'enterprise', 'split_expense', {
        splitType,
        txn: JSON.stringify(res.tx),
        currencyObj: JSON.stringify(this.fg.controls.currencyObj.value),
        fileObjs: res.dataUrls, // Todo: Need to check passing array is enough or need to do JSON.stringify before
        // selectedCCCTransaction: vm.selectedCCCTransaction
      }]);
    });

  }

  async splitExpense() {
    return forkJoin({
      costCenters: this.costCenters$,
      projects: this.offlineService.getProjects()
    }).subscribe(async res => {
      const areCostCentersAvailable = res.costCenters.length > 0;
      const areProjectsAvailable = res.projects.length > 0;
      let popupTypeItemClass = '';
      if (areProjectsAvailable || areCostCentersAvailable) {
        popupTypeItemClass = 'two-items-list';

        if (areProjectsAvailable && areCostCentersAvailable) {
          popupTypeItemClass = 'three-items-list';
        }
      }

      const splitExpensePopover = await this.popoverController.create({
        component: SplitExpensePopoverComponent,
        componentProps: {
          class: popupTypeItemClass,
          areProjectsAvailable,
          areCostCentersAvailable
        },
        cssClass: 'split-expense-popover'
      });
      await splitExpensePopover.present();

      const { data } = await splitExpensePopover.onWillDismiss();

      if (data && data.type) {
        this.openSplitExpenseModal(data.type);
      }
    })
  }

  ngOnInit() {
  }

  getFormValidationErrors() {
    Object.keys(this.fg.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.fg.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }

  setupCostCenters() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();

    this.costCenters$ = forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$
    }).pipe(
      switchMap(({ orgSettings, orgUserSettings }) => {
        if (orgSettings.cost_centers.enabled) {
          return this.offlineService.getAllowedCostCenters(orgUserSettings);
        } else {
          return of([]);
        }
      }),
      map(costCenters => {
        return costCenters.map(costCenter => ({
          label: costCenter.name,
          value: costCenter
        }));
      })
    );
  }

  setupTransactionMandatoryFields() {
    this.transactionMandatoyFields$ = this.isConnected$.pipe(
      filter(isConnected => !!isConnected),
      switchMap(() => {
        return this.offlineService.getOrgSettings();
      }),
      map(orgSettings => orgSettings.transaction_fields_settings.transaction_mandatory_fields || {})
    );

    this.transactionMandatoyFields$
      .pipe(
        filter(transactionMandatoyFields => !isEqual(transactionMandatoyFields, {})),
        tap(console.log)
      )
      .subscribe((transactionMandatoyFields: any) => {
        if (transactionMandatoyFields.project) {
          this.fg.controls.project.setValidators(Validators.required);
          this.fg.controls.project.updateValueAndValidity();
        }

        if (transactionMandatoyFields.category) {
          this.fg.controls.category.setValidators(Validators.required);
          this.fg.controls.category.updateValueAndValidity();
        }
      });
  }

  setupBalanceFlag() {
    const accounts$ = this.offlineService.getAccounts();

    this.isBalanceAvailableInAnyAdvanceAccount$ = this.fg.controls.paymentMode.valueChanges.pipe(
      switchMap((paymentMode) => {
        if (paymentMode && paymentMode.acc && paymentMode.acc.type === 'PERSONAL_ACCOUNT') {
          return accounts$.pipe(
            map(accounts => {
              return accounts.filter(account => account && account.acc && account.acc.type === 'PERSONAL_ADVANCE_ACCOUNT').length > 0;
            })
          );
        }
        return of(false);
      })
    );
  }

  getPaymentModes() {
    const accounts$ = this.offlineService.getAccounts();
    const orgSettings$ = this.offlineService.getOrgSettings();

    return forkJoin({
      accounts: accounts$,
      orgSettings: orgSettings$
    }).pipe(
      map(({ accounts, orgSettings }) => {
        const isAdvanceEnabled = (orgSettings.advances && orgSettings.advances.enabled) ||
          (orgSettings.advance_requests && orgSettings.advance_requests.enabled);
        const isMultipleAdvanceEnabled = orgSettings && orgSettings.advance_account_settings &&
          orgSettings.advance_account_settings.multiple_accounts;
        const userAccounts = this.accountsService.filterAccountsWithSufficientBalance(accounts, isAdvanceEnabled);
        return this.accountsService.constructPaymentModes(userAccounts, isMultipleAdvanceEnabled);
      }),
      map(paymentModes => paymentModes.map((paymentMode: any) => ({ label: paymentMode.acc.displayName, value: paymentMode })))
    );
  }

  getActiveCategories() {
    const allCategories$ = this.offlineService.getAllCategories();

    return allCategories$.pipe(
      map(catogories => catogories.filter(category => category.enabled === true)),
      map(catogories => this.categoriesService.filterRequired(catogories))
    );
  }

  getInstaFyleImageData() {
    if (this.activatedRoute.snapshot.params.dataUrl) {
      return from(this.loaderService.showLoader('Applying Fyle Magic...'))
        .pipe(
          switchMap(() => {
            const dataUrl = this.activatedRoute.snapshot.params.dataUrl;
            const b64Image = dataUrl.replace('data:image/jpeg;base64,', '');
            return from(this.transactionOutboxService.parseReceipt(b64Image));
          }),
          map((parsedResponse) => ({
            parsedResponse: parsedResponse.data,
            auditCallBackUrl: parsedResponse.callback_url
          })),
          catchError((err) => {
            return of({
              error: true,
              parsedResponse: {
                source: 'MOBILE_INSTA'
              }
            });
          }),
          switchMap((extractedDetails: any) => {
            const instaFyleImageData = {
              thumbnail: this.activatedRoute.snapshot.params.dataUrl,
              type: 'image',
              url: this.activatedRoute.snapshot.params.dataUrl,
              ...extractedDetails
            };

            // TODO: Check and Add iamge coordinates

            if (extractedDetails.parsedResponse) {
              return this.offlineService.getHomeCurrency().pipe(
                switchMap(homeCurrency => {
                  if (homeCurrency !== extractedDetails.parsedResponse.currency) {
                    return this.currencyService.getExchangeRate(
                      extractedDetails.parsedResponse.currency,
                      homeCurrency,
                      extractedDetails.parsedResponse.date ?
                        new Date(extractedDetails.parsedResponse.date) :
                        new Date()
                    ).pipe(
                      map(exchangeRate => {
                        return {
                          ...instaFyleImageData,
                          exchangeRate
                        };
                      })
                    );
                  } else {
                    return of(instaFyleImageData);
                  }
                })
              );
            } else {
              return of(instaFyleImageData);
            }
          }),
          finalize(() => from(this.loaderService.hideLoader()))
        );
    } else {
      return of(null);
    }
  }

  getNewExpenseObservable() {
    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const accounts$ = this.offlineService.getAccounts();
    const eou$ = from(this.authService.getEou());


    const instaFyleSettings$ = this.offlineService.getOrgUserSettings().pipe(
      map(orgUserSettings => orgUserSettings.insta_fyle_settings),
      map(instaFyleSettings => ({
        shouldExtractAmount: instaFyleSettings.extract_fields.indexOf('AMOUNT') > -1,
        shouldExtractCurrency: instaFyleSettings.extract_fields.indexOf('CURRENCY') > -1,
        shouldExtractDate: instaFyleSettings.extract_fields.indexOf('TXN_DT') > -1,
        shouldExtractCategory: instaFyleSettings.extract_fields.indexOf('CATEGORY') > -1,
        shouldExtractMerchant: instaFyleSettings.extract_fields.indexOf('MERCHANT') > -1
      }))
    );

    return forkJoin({
      orgSettings: orgSettings$,
      orgUserSettings: orgUserSettings$,
      categories: this.offlineService.getAllCategories(),
      homeCurrency: this.homeCurrency$,
      accounts: accounts$,
      eou: eou$,
      instaFyleSettings: instaFyleSettings$,
      imageData: this.getInstaFyleImageData()
    }).pipe(
      map((dependencies) => {
        const { orgSettings, orgUserSettings, categories, homeCurrency, accounts, eou, instaFyleSettings, imageData } = dependencies;
        const bankTxn = this.activatedRoute.snapshot.params.bankTxn;
        let etxn;
        if (!bankTxn) {
          etxn = {
            tx: {
              billable: false,
              skip_reimbursement: false,
              source: 'MOBILE',
              txn_dt: new Date(),
              currency: homeCurrency,
              amount: null,
              orig_currency: null,
              orig_amount: null,
              policy_amount: null,
              locations: [],
              custom_properties: [],
              num_files: this.activatedRoute.snapshot.params.dataUrl ? 1 : 0,
              org_user_id: eou.ou.id
            },
            dataUrls: []
          };

          if (orgUserSettings.currency_settings && orgUserSettings.currency_settings.enabled) {
            etxn.tx.currency = orgUserSettings.currency_settings.preferred_currency || etxn.tx.currency;
          }

          const receiptsData = this.activatedRoute.snapshot.params.receiptsData;

          if (receiptsData) {
            if (receiptsData.amount) {
              etxn.tx.amount = receiptsData.amount;
              etxn.tx.orig_amount = receiptsData.amount;
            }
            if (receiptsData.dataUrls) {
              etxn.dataUrls = receiptsData.dataUrls;
              etxn.tx.num_files = etxn.dataUrls ? 1 : 0;
            }
          }

          if (orgUserSettings.preferences && orgUserSettings.preferences.default_project_id) {
            etxn.tx.project_id = orgUserSettings.preferences.default_project_id;
          }

        } else {
          etxn = {
            tx: {
              txn_dt: new Date(bankTxn.ccce.txn_dt),
              source: 'MOBILE',
              currency: bankTxn.ccce.currency,
              org_category_id: bankTxn.org_category_id,
              amount: bankTxn.ccce.amount,
              vendor: bankTxn.ccce.vendor,
              purpose: bankTxn.ccce.description,
              skip_reimbursement: false,
              locations: [],
              hotel_is_breakfast_provided: false,
              num_files: 0,
              org_user_id: eou.ou.id
            },
            dataUrls: []
          };
        }

        if (imageData && imageData.error) {
          this.instaFyleCancelled = true;
        } else if (imageData) {
          const extractedData = {
            amount: imageData && imageData.parsedResponse && imageData.parsedResponse.amount,
            currency: imageData && imageData.parsedResponse && imageData.parsedResponse.currency,
            category: imageData && imageData.parsedResponse && imageData.parsedResponse.category,
            date: (imageData && imageData.parsedResponse && imageData.parsedResponse.date) ? new Date(imageData.parsedResponse.date) : null,
            vendor: imageData && imageData.parsedResponse && imageData.parsedResponse.vendor,
            invoice_dt: imageData && imageData.parsedResponse && imageData.parsedResponse.invoice_dt || null
          };

          etxn.tx.extracted_data = extractedData;

          if (instaFyleSettings.shouldExtractAmount && extractedData.amount) {
            etxn.tx.amount = extractedData.amount;
          }

          if (instaFyleSettings.shouldExtractCurrency && extractedData.currency) {
            etxn.tx.currency = extractedData.currency;


            if (homeCurrency !== extractedData.currency &&
              instaFyleSettings.shouldExtractAmount &&
              extractedData.amount &&
              imageData.exchangeRate) {
              etxn.tx.orig_amount = extractedData.amount;
              etxn.tx.orig_currency = extractedData.currency;
              etxn.tx.amount = imageData.exchangeRate * extractedData.amount;
              etxn.tx.currency = homeCurrency;
            }
          }

          if (instaFyleSettings.shouldExtractDate && extractedData.date) {
            etxn.tx.txn_dt = new Date(extractedData.date);
          }

          if (instaFyleSettings.shouldExtractDate && extractedData.invoice_dt) {
            etxn.tx.txn_dt = new Date(extractedData.invoice_dt);
          }

          if (instaFyleSettings.shouldExtractMerchant && extractedData.vendor) {
            etxn.tx.vendor = extractedData.vendor;
          }

          if (instaFyleSettings.shouldExtractCategory && extractedData.category) {
            const categoryName = extractedData.category || 'unspecified';
            const category = categories.find(orgCategory => orgCategory.name === categoryName);
            etxn.tx.org_category_id = category && category.id;
          }

          etxn.tx.source = 'MOBILE_INSTA';
          etxn.dataUrls.push({
            url: imageData.url,
            type: 'image',
            thumbnail: imageData.url
          });
          etxn.tx.num_files = etxn.dataUrls.length;
        }


        return etxn;
      }),
      shareReplay(1)
    );
  }

  setupFormInit(allCategories$: Observable<any>) {
    const selectedProject$ = this.etxn$.pipe(switchMap(etxn => {
      return iif(() => etxn.tx.project_id, this.projectService.getbyId(etxn.tx.project_id), of(null));
    }));

    const selectedCategory$ = this.etxn$.pipe(switchMap(etxn => {
      return iif(() => etxn.tx.org_category_id,
        allCategories$.pipe(
          map(categories => categories
            .find(category => category.id === etxn.tx.org_category_id))), of(null));
    }));
    const selectedReport$ = this.etxn$.pipe(switchMap(etxn => {
      return iif(() => etxn.tx.report_id, this.reports$.pipe(map(reportOptions => reportOptions
        .map(res => res.value)
        .find(reportOption => reportOption.id === etxn.tx.report_id))), of(null));
    }));

    // TODO: Handle the case of Paid by Company
    const selectedPaymentMode$ = this.etxn$.pipe(switchMap(etxn => {
      return iif(() => etxn.tx.source_account_id, this.paymentModes$.pipe(
        map(paymentModes => paymentModes
          .map(res => res.value)
          .find(paymentMode => paymentMode.acc.id === etxn.tx.source_account_id))
      ), of(null));
    }));
    const selectedCostCenter$ = this.etxn$.pipe(switchMap(etxn => {
      return iif(() => etxn.tx.cost_center_id, this.costCenters$.pipe(map(costCenters => costCenters
        .map(res => res.value)
        .find(costCenter => costCenter.id === etxn.tx.cost_center_id))), of(null));
    }));

    const selectedCustomInputs$ = this.etxn$.pipe(
      switchMap(etxn => {
        return this.offlineService.getCustomInputs().pipe(map(customFields => {
          return this.customFieldsService
            .standardizeCustomFields([], this.customInputsService.filterByCategory(customFields, etxn.tx.org_category_id));
        }));
      })
    );

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return forkJoin({
          etxn: this.etxn$,
          paymentMode: selectedPaymentMode$,
          project: selectedProject$,
          category: selectedCategory$,
          report: selectedReport$,
          costCenter: selectedCostCenter$,
          customInputs: selectedCustomInputs$
        });
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    ).subscribe(({ etxn, paymentMode, project, category, report, costCenter, customInputs }) => {
      const customInputValues = customInputs
        .map(customInput => {
          const cpor = etxn.tx.custom_properties && etxn.tx.custom_properties.find(customProp => customProp.name === customInput.name);
          return {
            name: customInput.name,
            value: (cpor && cpor.value) || null
          };
        });

      if (etxn.tx.amount && etxn.tx.currency) {
        console.log(etxn.tx);
        this.fg.patchValue({
          currencyObj: {
            amount: etxn.tx.amount,
            currency: etxn.tx.currency,
            orig_amount: etxn.tx.orig_amount,
            orig_currency: etxn.tx.orig_currency,
          }
        });
      } else if (etxn.tx.user_amount) {
        this.fg.patchValue({
          currencyObj: {
            amount: etxn.tx.user_amount,
            currency: etxn.tx.currency,
            orig_amount: null,
            orig_currency: null,
          }
        });
      }

      this.fg.patchValue({
        paymentMode,
        project,
        category,
        dateOfSpend: etxn.tx.txn_dt && moment(etxn.tx.txn_dt).format('y-MM-DD'),
        merchant: {
          display_name: etxn.tx.vendor
        },
        purpose: etxn.tx.purpose,
        report,
        taxValue: etxn.tx.tax,
        location_1: etxn.tx.locations[0],
        location_2: etxn.tx.locations[1],
        from_dt: etxn.tx.from_dt && moment(etxn.tx.from_dt).format('y-MM-DD'),
        to_dt: etxn.tx.to_dt && moment(etxn.tx.to_dt).format('y-MM-DD'),
        flight_journey_travel_class: etxn.tx.flight_journey_travel_class,
        flight_return_travel_class: etxn.tx.flight_return_travel_class,
        train_travel_class: etxn.tx.train_travel_class,
        bus_travel_class: etxn.tx.bus_travel_class,
        distance: etxn.tx.distance,
        distance_unit: etxn.tx.distance_unit,
        duplicate_detection_reason: etxn.tx.user_reason_for_duplicate_expenses,
        billable: etxn.tx.billable,
        custom_inputs: customInputValues,
        costCenter
      }, {
        emitEvent: false
      });

      setTimeout(() => {
        this.fg.controls.custom_inputs.setValue(customInputValues);
      }, 1000);

      this.attachedReceiptsCount = etxn.tx.num_files;

      if (etxn.dataUrls && etxn.dataUrls.length) {
        this.newExpenseDataUrls = etxn.dataUrls;
      }
    });
  }

  setupCustomFields() {
    this.customInputs$ = this.fg.controls.category.valueChanges
      .pipe(
        startWith({}),
        switchMap((category) => {
          const selectedCategory$ = this.etxn$.pipe(switchMap(etxn => {
            return iif(
              () => etxn.tx.org_category_id,
              this.offlineService.getAllCategories()
                .pipe(
                  map(categories => categories.find(category => category.id === etxn.tx.org_category_id))
                ),
              of(null)
            );
          }));
          return iif(() => this.mode === 'add', of(category), selectedCategory$);
        }),
        switchMap((category) => {
          const formValue = this.fg.value;
          return this.offlineService.getCustomInputs().pipe(
            map(customFields => {
              return this.customFieldsService
                .standardizeCustomFields(
                  formValue.custom_inputs || [],
                  this.customInputsService.filterByCategory(customFields, category && category.id)
                );
            })
          );
        }),
        map(customFields => {
          return customFields.map(customField => {
            if (customField.options) {
              customField.options = customField.options.map(option => ({ label: option, value: option }));
            }
            return customField;
          });
        }),
        tap(console.log),
        switchMap((customFields: any[]) => {
          return this.isConnected$.pipe(
            map(isConnected => {
              const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
              customFieldsFormArray.clear();
              for (const customField of customFields) {
                customFieldsFormArray.push(
                  this.formBuilder.group({
                    name: [customField.name],
                    // Since in boolean, required validation is kinda unnecessary
                    value: [
                      customField.value,
                      customField.type !== 'BOOLEAN' && customField.mandatory && isConnected && Validators.required
                    ]
                  })
                );
              }
              customFieldsFormArray.updateValueAndValidity();
              return customFields.map((customField, i) => ({ ...customField, control: customFieldsFormArray.at(i) }));
            })
          );
        }),
        shareReplay()
      );
  }

  setupTfc() {
    this.txnFields$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) => {
        return this.offlineService.getTransactionFieldConfigurationsMap().pipe(switchMap(tfcMap => {
          const fields = ['purpose', 'txn_dt', 'vendor_id', 'cost_center_id', 'from_dt', 'to_dt', 'location1', 'location2', 'distance', 'distance_unit', 'flight_journey_travel_class', 'flight_return_travel_class', 'train_travel_class', 'bus_travel_class'];
          return this.transactionFieldConfigurationService
            .filterByOrgCategoryIdProjectId(
              tfcMap,
              fields,
              formValue.category,
              formValue.project
            );
        }));
      }),
      map((tfcMap: any) => {
        if (tfcMap) {
          for (const tfc of Object.keys(tfcMap)) {
            if (tfcMap[tfc].values && tfcMap[tfc].values.length > 0) {
              tfcMap[tfc].values = tfcMap[tfc].values.map(value => ({ label: value, value }));
            }
          }
        }
        return tfcMap;
      }),
      tap(console.log),
      shareReplay());

    this.txnFields$.pipe(
      distinctUntilChanged((a, b) => isEqual(a, b)),
      switchMap(txnFields => {
        return forkJoin({ isConnected: this.isConnected$, orgSettings: this.offlineService.getOrgSettings() }).pipe(
          map(({ isConnected, orgSettings }) => ({
            isConnected,
            txnFields,
            orgSettings
          }))
        );
      })
    ).subscribe(({ isConnected, txnFields, orgSettings }) => {
      const keyToControlMap: {
        [id: string]: AbstractControl;
      } = {
        purpose: this.fg.controls.purpose,
        txn_dt: this.fg.controls.dateOfSpend,
        vendor_id: this.fg.controls.merchant,
        cost_center_id: this.fg.controls.costCenter,
        from_dt: this.fg.controls.from_dt,
        to_dt: this.fg.controls.to_dt,
        location1: this.fg.controls.location_1,
        location2: this.fg.controls.location_2,
        distance: this.fg.controls.distance,
        distance_unit: this.fg.controls.distance_unit,
        flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
        flight_return_travel_class: this.fg.controls.flight_return_travel_class,
        train_travel_class: this.fg.controls.train_travel_class,
        bus_travel_class: this.fg.controls.bus_travel_class
      };
      for (const control of Object.values(keyToControlMap)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
      for (const txnFieldKey of Object.keys(txnFields)) {
        const control = keyToControlMap[txnFieldKey];
        if (txnFields[txnFieldKey].mandatory) {
          if (txnFieldKey === 'vendor_id') {
            control.setValidators(Validators.compose([isConnected ? Validators.required : null, this.merchantValidator]));
          } else if ([
            'location1',
            'location2',
            'from_dt',
            'to_dt',
            'flight_journey_travel_class',
            'flight_return_travel_class',
            'train_travel_class',
            'bus_travel_class'
          ].includes(txnFieldKey)) {
            if (this.fg.value.category &&
              this.fg.value.category.fyle_category &&
              ['Bus', 'Flight', 'Hotel', 'Train'].includes(this.fg.value.category.fyle_category) &&
              !(orgSettings.projects && orgSettings.projects.enabled && !isConnected)
            ) {
              control.setValidators(Validators.required);
            }
          } else {
            control.setValidators(isConnected ? Validators.required : null);
          }
        }
        else {
          if (txnFieldKey === 'vendor_id') {
            control.setValidators(this.merchantValidator);
          }
        }
        control.updateValueAndValidity();
      }
      this.fg.updateValueAndValidity();
    });
  }

  setupFilteredCategories(activeCategories$: Observable<any>) {
    this.filteredCategories$ = this.fg.controls.project.valueChanges.pipe(
      startWith(this.fg.controls.project.value),
      concatMap(project => {
        return activeCategories$.pipe(map(activeCategories => this.projectService.getAllowedOrgCategoryIds(project, activeCategories)));
      }), map(categories => categories.map(category => ({ label: category.displayName, value: category }))));

    this.filteredCategories$.subscribe(categories => {
      if (this.fg.value.category
        && this.fg.value.category.id
        && !categories.some(category => this.fg.value.category && this.fg.value.category.id === category.value.id)) {
        this.fg.controls.category.reset();
      }
    });
  }

  getEditExpenseObservable() {
    return this.transactionService.getETxn(this.activatedRoute.snapshot.params.id).pipe(
      switchMap(etxn => {
        const instaFyleSettings$ = this.offlineService.getOrgUserSettings().pipe(
          map(orgUserSettings => orgUserSettings.insta_fyle_settings)
        );
        if (etxn.tx.state === 'DRAFT' && etxn.tx.extracted_data) {
          return forkJoin({
            instaFyleSettings: instaFyleSettings$,
            allCategories: this.offlineService.getAllCategories()
          }).pipe(
            switchMap(({ instaFyleSettings, allCategories }) => {
              const shouldExtractAmount = instaFyleSettings.extract_fields.indexOf('AMOUNT') > -1;
              const shouldExtractCurrency = instaFyleSettings.extract_fields.indexOf('CURRENCY') > -1;
              const shouldExtractDate = instaFyleSettings.extract_fields.indexOf('TXN_DT') > -1;
              const shouldExtractCategory = instaFyleSettings.extract_fields.indexOf('CATEGORY') > -1;
              const shouldExtractMerchant = instaFyleSettings.extract_fields.indexOf('MERCHANT') > -1;

              if (shouldExtractAmount && etxn.tx.extracted_data.amount && !etxn.tx.amount) {
                etxn.tx.amount = etxn.tx.extracted_data.amount;
              }

              if (shouldExtractCurrency && etxn.tx.extracted_data.currency && !etxn.tx.currency) {
                etxn.tx.currency = etxn.tx.extracted_data.currency;
              }

              if (shouldExtractDate && etxn.tx.extracted_data.date) {
                etxn.tx.txn_dt = new Date(etxn.tx.extracted_data.date);
              }

              if (shouldExtractDate && etxn.tx.extracted_data.invoice_dt) {
                etxn.tx.txn_dt = new Date(etxn.tx.extracted_data.invoice_dt);
              }

              if (shouldExtractMerchant && etxn.tx.extracted_data.vendor && etxn.tx.vendor) {
                etxn.tx.vendor = etxn.tx.extracted_data.vendor;
              }

              if (shouldExtractCategory && etxn.tx.extracted_data.category
                && etxn.tx.fyle_category && etxn.tx.fyle_category.toLowerCase() === 'unspecified') {
                const categoryName = etxn.tx.extracted_data.category || 'unspecified';
                const category = allCategories.find(category => category.name === categoryName);
                etxn.tx.id = category.id;
              }
              return of(etxn);
            })
          );
        }
        return of(etxn);
      }),
      shareReplay()
    );
  }

  goToPrev() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex - 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex - 1]).subscribe(etxn => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex - 1);
      });
    }
  }

  goToNext() {
    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;

    if (this.reviewList[+this.activeIndex + 1]) {
      this.transactionService.getETxn(this.reviewList[+this.activeIndex + 1]).subscribe(etxn => {
        this.goToTransaction(etxn, this.reviewList, +this.activeIndex + 1);
      });
    }
  }

  goToTransaction(expense, reviewList, activeIndex) {
    let category;

    if (expense.tx.org_category) {
      category = expense.tx.org_category.toLowerCase();
    }
    //TODO: Leave for later
    // if (category === 'activity') {
    //   showCannotEditActivityDialog();

    //   return;
    // }

    if (category === 'mileage') {
      this.router.navigate(['/', 'enterprise', 'add_edit_mileage', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    } else if (category === 'per diem') {
      this.router.navigate(['/', 'enterprise', 'add_edit_per_diem', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    } else {
      this.router.navigate(['/', 'enterprise', 'add_edit_expense', {
        id: expense.tx.id, txnIds: JSON.stringify(reviewList), activeIndex
      }]);
    }
  }

  ionViewWillEnter() {
    const currentNavigation = this.router.getCurrentNavigation();
    const prevNavigation = currentNavigation && currentNavigation.previousNavigation;
    console.log(prevNavigation);

    this.fg = this.formBuilder.group({
      currencyObj: [, this.currencyObjValidator],
      paymentMode: [, Validators.required],
      project: [],
      category: [],
      dateOfSpend: [],
      merchant: [, this.merchantValidator],
      purpose: [],
      report: [],
      tax: [],
      taxValue: [],
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: []
    });

    this.setupDuplicateDetection();
    this.setUpTaxCalculations();

    const orgSettings$ = this.offlineService.getOrgSettings();
    const orgUserSettings$ = this.offlineService.getOrgUserSettings();
    const allCategories$ = this.offlineService.getAllCategories();
    this.homeCurrency$ = this.offlineService.getHomeCurrency();
    const accounts$ = this.offlineService.getAccounts();

    this.setupNetworkWatcher();

    this.receiptsData = this.activatedRoute.snapshot.params.receiptsData;

    this.setupCostCenters();
    this.setupTransactionMandatoryFields();

    this.mode = this.activatedRoute.snapshot.params.id ? 'edit' : 'add';

    this.isCreatedFromCCC = !this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn;

    this.activeIndex = this.activatedRoute.snapshot.params.activeIndex;
    this.reviewList = this.activatedRoute.snapshot.params.txnIds && JSON.parse(this.activatedRoute.snapshot.params.txnIds);

    this.title = 'Add Expense';
    this.title = this.activeIndex > -1 && this.reviewList && this.activeIndex < this.reviewList.length ? 'Review' : 'Edit';
    this.duplicateBoxOpen = false;

    this.isProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.projects && orgSettings.projects.enabled)
    );

    this.isSplitExpenseAllowed$ = orgSettings$.pipe(
      map(orgSettings => {
        return orgSettings.expense_settings.split_expense_settings.enabled;
      })
    );

    this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.advanced_projects && orgSettings.advanced_projects.enable_individual_projects)
    );

    this.individualProjectIds$ = orgUserSettings$.pipe(
      map((orgUserSettings: any) => orgUserSettings.project_ids || [])
    );

    this.setupBalanceFlag();

    const today = new Date();
    this.minDate = moment(new Date('Jan 1, 2001')).format('y-MM-D');
    this.maxDate = moment(this.dateService.addDaysToDate(today, 1)).format('y-MM-D');

    const activeCategories$ = this.getActiveCategories();

    this.paymentModes$ = this.getPaymentModes();

    this.pickRecentCurrency$ = orgUserSettings$.pipe(
      map(orgUserSettings => {
        if (orgUserSettings.currency_settings && orgUserSettings.currency_settings.enabled) {
          return orgUserSettings.currency_settings.preferred_currency && '';
        } else {
          return 'true';
        }
      })
    );

    this.paymentAccount$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
        } else {
          return null;
        }
      })
    );

    this.isCCCAccountSelected$ = accounts$.pipe(
      map((accounts) => {
        if (!this.activatedRoute.snapshot.params.id && this.activatedRoute.snapshot.params.bankTxn) {
          return accounts.find((account) => account.acc.type === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT').length > 0;
        } else {
          return false;
        }
      })
    );

    const newExpensePipe$ = this.getNewExpenseObservable();

    const editExpensePipe$ = this.getEditExpenseObservable();

    this.etxn$ = iif(() => this.activatedRoute.snapshot.params.id, editExpensePipe$, newExpensePipe$);

    this.setupFilteredCategories(activeCategories$);

    this.setupTfc();

    this.flightJourneyTravelClassOptions$ = this.txnFields$.pipe(
      map(txnFields => {
        return txnFields.flight_journey_travel_class && txnFields.flight_journey_travel_class.values.map(v => ({ label: v, value: v }));
      })
    );

    this.taxSettings$ = orgSettings$.pipe(
      map(orgSettings => orgSettings.tax_settings.groups),
      map(taxs => taxs.map(tax => ({ label: tax.name, value: tax })))
    );

    this.reports$ = this.reportService.getFilteredPendingReports({ state: 'edit' }).pipe(
      map(reports => reports.map(report => ({ label: report.rp.purpose, value: report })))
    );

    this.setupCustomFields();

    this.setupFormInit(allCategories$);

    this.transactionInReport$ = this.etxn$.pipe(
      map(etxn => ['APPROVER_PENDING', 'APPROVER_INQUIRY'].indexOf(etxn.tx.state) > -1)
    );

    this.isNotReimbursable$ = this.etxn$.pipe(map(etxn => !etxn.tx.user_can_delete && this.mode === 'edit'));

    this.isAmountCapped$ = this.etxn$.pipe(
      map(
        etxn => isNumber(etxn.tx.admin_amount) || isNumber(etxn.tx.policy_amount)
      )
    );

    this.isAmountDisabled$ = this.etxn$.pipe(
      map(
        etxn => !!etxn.tx.admin_amount
      )
    );

    this.isCriticalPolicyViolated$ = this.etxn$.pipe(
      map(
        etxn => isNumber(etxn.tx.policy_amount) && (etxn.tx.policy_amount < 0.0001)
      )
    );
  }

  generateEtxnFromFg(etxn$, standardisedCustomProperties$) {
    return forkJoin({
      etxn: etxn$,
      customProperties: standardisedCustomProperties$
    }).pipe(
      map((res) => {
        const etxn: any = res.etxn;
        const customProperties = res.customProperties;
        let locations;
        if (this.fg.value.location_1 && this.fg.value.location_2) {
          locations = [
            this.fg.value.location_1,
            this.fg.value.location_2
          ];
        }

        return {
          tx: {
            ...etxn.tx,
            billable: this.fg.value.billable,
            skip_reimbursement: this.fg.value.paymentMode && this.fg.value.paymentMode.acc.isReimbursable,
            txn_dt: this.fg.value.dateOfSpend && new Date(this.fg.value.dateOfSpend),
            currency: this.fg.value.currencyObj && this.fg.value.currencyObj.currency,
            amount: this.fg.value.currencyObj && this.fg.value.currencyObj.amount,
            orig_currency: this.fg.value.currencyObj && this.fg.value.currencyObj.orig_currency,
            orig_amount: this.fg.value.currencyObj && this.fg.value.currencyObj.orig_amount,
            project_id: this.fg.value.project && this.fg.value.project.project_id,
            org_category_id: this.fg.value.category && this.fg.value.category.id,
            fyle_category: this.fg.value.category && this.fg.value.category.fyle_category,
            policy_amount: null,
            vendor: this.fg.value.merchant && this.fg.value.merchant.display_name,
            purpose: this.fg.value.purpose,
            locations,
            custom_properties: customProperties || [],
            num_files: this.activatedRoute.snapshot.params.dataUrl ? 1 : 0,
            org_user_id: etxn.tx.org_user_id,
            from_dt: this.fg.value.from_dt && new Date(this.fg.value.from_dt),
            to_dt: this.fg.value.to_dt && new Date(this.fg.value.to_dt),
            flight_journey_travel_class: this.fg.value.flight_journey_travel_class,
            flight_return_travel_class: this.fg.value.flight_return_travel_class,
            train_travel_class: this.fg.value.train_travel_class,
            bus_travel_class: this.fg.value.bus_travel_class,
            distance: this.fg.value.distance,
            distance_unit: this.fg.value.distance_unit,
            report_id: this.fg.value.report && this.fg.value.report.rp && this.fg.value.report.rp.id
          },
          ou: etxn.ou,
          dataUrls: [].concat(this.newExpenseDataUrls)
        };
      })
    );
  }

  checkPolicyViolation(etxn) {
    // Prepare etxn object with just tx and ou object required for test call
    return from(this.authService.getEou()).pipe(
      switchMap(currentEou => {
        const policyETxn = {
          tx: cloneDeep(etxn.tx),
          ou: cloneDeep(etxn.ou)
        };

        if (!etxn.tx.id) {
          policyETxn.ou = currentEou.ou;
        }
        /* Adding number of attachements and sending in test call as tx_num_files
         * If editing an expense with receipts, check for already uploaded receipts
         */
        if (etxn.tx) {
          policyETxn.tx.num_files = etxn.tx.num_files;

          // Check for receipts uploaded from mobile
          if (etxn.dataUrls && etxn.dataUrls.length > 0) {
            policyETxn.tx.num_files = etxn.tx.num_files + etxn.dataUrls.length;
          }
        }

        return this.offlineService.getAllCategories().pipe(
          map((categories: any[]) => {
            // policy engine expects org_category and sub_category fields
            if (policyETxn.tx.org_category_id) {
              const orgCategory = categories.find(cat => cat.id === policyETxn.tx.org_category_id);
              policyETxn.tx.org_category = orgCategory && orgCategory.name;
              policyETxn.tx.sub_category = orgCategory && orgCategory.sub_category;
            } else {
              policyETxn.tx.org_category_id = null;
              policyETxn.tx.sub_category = null;
              policyETxn.tx.org_category = null;
            }

            // Flatten the etxn obj
            return this.dataTransformService.etxnRaw(policyETxn);

          })
        );
      }),
      switchMap((policyETxn) => {
        return this.transactionService.testPolicy(policyETxn);
      })
    );
  }

  getCustomFields() {
    return this.customInputs$.pipe(
      take(1),
      map(customInputs => {
        return customInputs.map((customInput, i) => {
          return {
            id: customInput.id,
            mandatory: customInput.mandatory,
            name: customInput.name,
            options: customInput.options,
            placeholder: customInput.placeholder,
            prefix: customInput.prefix,
            type: customInput.type,
            value: this.fg.value.custom_inputs[i].value
          };
        });
      })
    );
  }

  // public findInvalidControlsRecursive(formToInvestigate:FormGroup|FormArray):string[] {
  //   var invalidControls:string[] = [];
  //   let recursiveFunc = (form:FormGroup|FormArray) => {
  //     Object.keys(form.controls).forEach(field => { 
  //       const control = form.get(field);
  //       if (control.invalid) invalidControls.push(field);
  //       if (control instanceof FormGroup) {
  //         recursiveFunc(control);
  //       } else if (control instanceof FormArray) {
  //         recursiveFunc(control);
  //       }        
  //     });
  //   }
  //   recursiveFunc(formToInvestigate);
  //   return invalidControls;
  // }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/enterprise/my_expenses', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  saveExpense() {
    const that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense().subscribe(()=> {
            that.goBack();
          });
        } else {
          // to do edit
          that.editExpense().subscribe(noop);
        }
      } else {
        that.fg.markAllAsTouched();
        if (invalidPaymentMode) {
          that.invalidPaymentMode = true;
          setTimeout(() => {
            that.invalidPaymentMode = false;
          }, 3000);
        }
      }
    });
  }

  saveAndNewExpense() {
    let that = this;

    that.checkIfInvalidPaymentMode().pipe(
      take(1)
    ).subscribe(invalidPaymentMode => {
      if (that.fg.valid && !invalidPaymentMode) {
        if (that.mode === 'add') {
          that.addExpense().subscribe(() => {
            this.reloadCurrentRoute();
          });
        } else {
          // to do edit
          that.editExpense().subscribe(noop);
        }
      } else {
        that.fg.markAllAsTouched();
        if (invalidPaymentMode) {
          that.invalidPaymentMode = true;
          setTimeout(() => {
            that.invalidPaymentMode = false;
          }, 3000);
        }
      }
    });
  }

  saveExpenseAndGotoNext() {
    const that = this;
    if (that.fg.valid) {
      if (that.mode === 'add') {
        that.addExpense().subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.closeAddEditExpenses();
          } else {
            that.goToNext();
          }
        });
      } else {
        // to do edit
        that.editExpense().subscribe(() => {
          if (+this.activeIndex === this.reviewList.length - 1) {
            that.closeAddEditExpenses();
          } else {
            that.goToNext();
          }
        });
      }
    } else {
      that.fg.markAllAsTouched();
    }
  }

  async continueWithCriticalPolicyViolation(criticalPolicyViolations: string[]) {
    const currencyModal = await this.modalController.create({
      component: CriticalPolicyViolationComponent,
      componentProps: {
        criticalViolationMessages: criticalPolicyViolations
      }
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
    return !!data;
  }

  async continueWithPolicyViolations(policyViolations: string[], policyActionDescription: string) {
    const currencyModal = await this.modalController.create({
      component: PolicyViolationComponent,
      componentProps: {
        policyViolationMessages: policyViolations,
        policyActionDescription
      }
    });

    await currencyModal.present();

    const { data } = await currencyModal.onWillDismiss();
    return data;
  }

  editExpense() {
    const customFields$ = this.getCustomFields();

    return from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          return this.generateEtxnFromFg(this.etxn$, customFields$);
        }),
        switchMap(etxn => {
          const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay());
          return policyViolations$.pipe(
            map(this.policyService.getCriticalPolicyRules),
            switchMap(policyViolations => {
              if (policyViolations.length > 0) {
                return throwError({
                  type: 'criticalPolicyViolations',
                  policyViolations,
                  etxn
                });
              }
              else {
                return policyViolations$;
              }
            }),
            map((policyViolations: any) =>
              [this.policyService.getPolicyRules(policyViolations),
              policyViolations &&
              policyViolations.transaction_desired_state &&
              policyViolations.transaction_desired_state.action_description]),
            switchMap(([policyViolations, policyActionDescription]) => {
              if (policyViolations.length > 0) {
                return throwError({
                  type: 'policyViolations',
                  policyViolations,
                  policyActionDescription,
                  etxn
                });
              }
              else {
                return of({ etxn });
              }
            })
          );
        }),
        catchError(err => {
          if (err.type === 'criticalPolicyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => {
                return this.continueWithCriticalPolicyViolation(err.policyViolations);
              }),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({ etxn: err.etxn });
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else if (err.type === 'policyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => {
                return this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription);
              }),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({ etxn: err.etxn, comment: continueWithTransaction.comment });
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else {
            return throwError(err);
          }
        }),
        switchMap(({ etxn, comment }: any) => {
          return forkJoin({
            eou: from(this.authService.getEou()),
            txnCopy: this.etxn$
          }).pipe(
            switchMap(({ eou, txnCopy }) => {

              // if (!isEqual(etxn.tx, txnCopy)) {
              //   // only if the form is edited
              //   TrackingService.editExpense
              // ({Asset: 'Mobile', Type: 'Receipt', Amount: etxn.tx.amount, Currency: etxn.tx.currency, 
              // Category: etxn.tx.org_category, Time_Spent: timeSpentOnExpensePage +' secs'});
              // } else {
              //   // tracking expense closed without editing
              //   TrackingService.viewExpense({Asset: 'Mobile', Type: 'Receipt'});
              // }

              // NOTE: This double call is done as certain fields will not be present in return of upsert call. policy_amount in this case.
              return this.transactionService.upsert(etxn.tx).pipe(
                switchMap(txn => {
                  return this.transactionService.getETxn(txn.id);
                }),
                map(savedEtxn => savedEtxn && savedEtxn.tx),
                switchMap((tx) => {

                  if (!txnCopy.report_id && etxn.tx.report_id) {
                    return this.reportService.addTransactions(etxn.tx.report_id, [tx.id]).pipe(map(() => tx));
                  }

                  if (txnCopy.report_id && etxn.tx.report_id && etxn.tx.report_id !== etxn.tx.report_id) {
                    return this.reportService.removeTransaction(txnCopy.report_id, tx.id).pipe(
                      switchMap(() => this.reportService.addTransactions(etxn.tx.report_id, [tx.id])),
                      map(() => tx)
                    );
                  }

                  if (txnCopy.report_id && !etxn.tx.report_id) {
                    return this.reportService.removeTransaction(txnCopy.report_id, tx.id).pipe(map(() => tx));
                  }

                  return of(null).pipe(map(() => tx));

                }),
                switchMap(tx => {
                  if (etxn.tx.user_review_needed) {
                    return this.transactionService.review(tx.id).pipe(map(() => tx));
                  }

                  return of(null).pipe(map(() => tx));
                })
              );
            }),
            switchMap((txn) => {
              if (comment) {
                return this.statusService.findLatestComment(txn.id, 'transactions', txn.org_user_id).pipe(
                  switchMap((result) => {
                    if (result !== comment) {
                      return this.statusService.post('transactions', txn.id, { comment }, true).pipe(
                        map(() => txn)
                      );
                    } else {
                      return of(txn);
                    }
                  })
                );
              } else {
                return of(txn);
              }
            }),
          );
        }),
        map((transaction) => {
          // if (transaction.corporate_credit_card_expense_group_id && selectedCCCTransaction && selectedCCCTransaction.id) {
          //   if (transaction.corporate_credit_card_expense_group_id !== selectedCCCTransaction.id) {
          //     this.transactionService.unmatchCCCExpense(transaction.id, matchedCCCTransaction.id).then(function () {
          //       this.transactionService.matchCCCExpense(transaction.id, selectedCCCTransaction.id);
          //     });
          //   }
          // }

          // //Case is for unmatching a matched expense
          // if (!selectedCCCTransaction && transaction.corporate_credit_card_expense_group_id) {
          //   this.transactionService.unmatchCCCExpense(transaction.id, matchedCCCTransaction.id);
          // }

          // //Case is for matching a normal(unmatched) expense for the first time(edit)
          // if (selectedCCCTransaction && !transaction.corporate_credit_card_expense_group_id) {
          //   this.transactionService.matchCCCExpense(transaction.id, selectedCCCTransaction.id);
          // }
          return transaction;
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      );
  }

  addExpense() {
    const customFields$ = this.getCustomFields();

    return from(this.loaderService.showLoader())
      .pipe(
        switchMap(() => {
          return this.generateEtxnFromFg(this.etxn$, customFields$);
        }),
        switchMap(etxn => {
          return this.isConnected$.pipe(
            switchMap(isConnected => {
              if (isConnected) {
                const policyViolations$ = this.checkPolicyViolation(etxn).pipe(shareReplay());
                return policyViolations$.pipe(
                  map(this.policyService.getCriticalPolicyRules),
                  switchMap(criticalPolicyViolations => {
                    if (criticalPolicyViolations.length > 0) {
                      return throwError(new Error('Critical Policy Violated'));
                    }
                    else {
                      return policyViolations$;
                    }
                  }),
                  map((policyViolations: any) =>
                    [this.policyService.getPolicyRules(policyViolations),
                    policyViolations &&
                    policyViolations.transaction_desired_state &&
                    policyViolations.transaction_desired_state.action_description]
                  ),
                  switchMap(([policyViolations, policyActionDescription]) => {
                    if (policyViolations.length > 0) {
                      return throwError({
                        type: 'policyViolations',
                        policyViolations,
                        policyActionDescription,
                        etxn
                      });
                    }
                    else {
                      return of({ etxn, comment: null });
                    }
                  })
                );
              } else {
                return of({ etxn, comment: null });
              }
            }));
        }),
        catchError(err => {
          if (err.type === 'criticalPolicyViolations') {
            return from(this.loaderService.hideLoader()).pipe(
              switchMap(() => {
                return this.continueWithCriticalPolicyViolation(err.policyViolations);
              }),
              switchMap((continueWithTransaction) => {
                if (continueWithTransaction) {
                  return from(this.loaderService.showLoader()).pipe(
                    switchMap(() => {
                      return of({ etxn: err.etxn });
                    })
                  );
                } else {
                  return throwError('unhandledError');
                }
              })
            );
          } else if (err.type === 'policyViolations') {
            return from(this.loaderService.hideLoader())
              .pipe(
                switchMap(() => {
                  return this.continueWithPolicyViolations(err.policyViolations, err.policyActionDescription);
                }),
                switchMap((continueWithTransaction) => {
                  if (continueWithTransaction) {
                    return from(this.loaderService.showLoader())
                      .pipe(
                        switchMap(() => {
                          return of({ etxn: err.etxn, comment: continueWithTransaction.comment });
                        })
                      );
                  } else {
                    return throwError('unhandledError');
                  }
                })
              );
          } else {
            return throwError(err);
          }
        }),
        switchMap(({ etxn, comment }: any) => {
          return from(this.authService.getEou())
            .pipe(
              switchMap(eou => {

                const comments = [];
                // if (this.activatedRoute.snapshot.params.dataUrl) {
                //   TrackingService.createExpense({Asset: 'Mobile', Category: 'InstaFyle'});
                // } else {
                //   TrackingService.createExpense
                // ({Asset: 'Mobile', Type: 'Receipt', Amount: this.etxn.tx.amount, 
                // Currency: this.etxn.tx.currency, Category: this.etxn.tx.org_category, Time_Spent: timeSpentOnExpensePage +' secs'});
                // }
                // if (this.saveAndCreate) {
                //   // track click of save and new expense button
                //   TrackingService.clickSaveAddNew({Asset: 'Mobile'});
                // }
                if (comment) {
                  comments.push(comment);
                }
                // if (this.selectedCCCTransaction) {
                //   this.etxn.tx.matchCCCId = this.selectedCCCTransaction.id;
                //   setSourceAccount('PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT');
                // }

                let reportId;
                if (this.fg.value.report
                  && (etxn.tx.policy_amount === null || (etxn.tx.policy_amount && !(etxn.tx.policy_amount < 0.0001)))) {
                  reportId = this.fg.value.report.id;
                }
                let entry;
                if (this.fg.value.add_to_new_report) {
                  entry = {
                    comments,
                    reportId
                  };
                }


                etxn.dataUrls = etxn.dataUrls.map(data => {

                  let attachmentType = 'image';

                  if (data.type === 'application/pdf') {
                    attachmentType = 'pdf';
                  }

                  data.type = attachmentType;

                  return data;
                });

                if (entry) {
                  return from(this.transactionOutboxService.addEntryAndSync(etxn.tx, etxn.dataUrls, entry.comments, entry.reportId));
                } else {
                  let receiptsData = null;
                  if (this.receiptsData) {
                    receiptsData = {
                      linked_by: eou.ou.id,
                      receipt_id: this.receiptsData.receiptId,
                      fileId: this.receiptsData.fileId
                    };
                  }
                  return of(this.transactionOutboxService.addEntry(etxn.tx, etxn.dataUrls, comments, reportId, null, receiptsData));
                }
              }
              )
            );
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      );
  }

  closeAddEditExpenses() {
    this.router.navigate(['/', 'enterprise', 'my_expenses']);
  }

  async addAttachments(event) {
    event.stopPropagation();
    event.preventDefault();

    const popup = await this.popoverController.create({
      component: CameraOptionsPopupComponent,
      cssClass: 'camera-options-popover'
    });

    await popup.present();

    const { data } = await popup.onWillDismiss();

    if (data) {
      if (this.mode === 'add') {
        this.newExpenseDataUrls.push({
          type: data.type,
          url: data.dataUrl,
          thumbnail: data.dataUrl
        });
        this.attachedReceiptsCount = this.newExpenseDataUrls.length;
      } else {
        const editExpenseAttachments$ = this.etxn$.pipe(
          switchMap(etxn => this.fileService.findByTransactionId(etxn.tx.id)),
          map(fileObjs => {
            return (fileObjs && fileObjs.length) || 0;
          })
        );

        this.attachmentUploadInProgress = true;
        let attachmentType = 'image';

        if (data.type === 'application/pdf') {
          attachmentType = 'pdf';
        }
        from(this.transactionOutboxService.fileUpload(data.dataUrl, attachmentType)).pipe(
          switchMap((fileObj: any) => {
            fileObj.transaction_id = this.activatedRoute.snapshot.params.id;
            return this.fileService.post(fileObj);
          }),
          switchMap(() => {
            return editExpenseAttachments$;
          }),
          finalize(() => {
            this.attachmentUploadInProgress = false;
          })
        ).subscribe((attachments) => {
          this.attachedReceiptsCount = attachments;
        });
      }
    }
  }

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg'
    };

    if (ext && (['pdf'].indexOf(ext) > -1)) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && (['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1)) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  viewAttachments() {
    const editExpenseAttachments = this.etxn$.pipe(
      switchMap(etxn => this.fileService.findByTransactionId(etxn.tx.id)),
      switchMap(fileObjs => {
        return from(fileObjs);
      }),
      concatMap((fileObj: any) => {
        return this.fileService.downloadUrl(fileObj.id).pipe(
          map(downloadUrl => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        );
      }),
      reduce((acc, curr) => acc.concat(curr), [])
    );

    const addExpenseAttachments = of(this.newExpenseDataUrls.map(fileObj => {
      fileObj.type = fileObj.type === 'application/pdf' ? 'pdf' : 'image';
      return fileObj;
    }));
    const attachements$ = iif(() => this.mode === 'add', addExpenseAttachments, editExpenseAttachments);

    from(this.loaderService.showLoader()).pipe(
      switchMap(() => {
        return attachements$;
      }),
      finalize(() => from(this.loaderService.hideLoader()))
    )
      .subscribe(async (attachments) => {
        const attachmentsModal = await this.modalController.create({
          component: ViewAttachmentsComponent,
          componentProps: {
            attachments
          }
        });

        await attachmentsModal.present();

        const { data } = await attachmentsModal.onWillDismiss();

        if (this.mode === 'add') {
          this.newExpenseDataUrls = data.attachments;
          this.attachedReceiptsCount = data.attachments.length;
        } else {
          this.etxn$.pipe(
            switchMap(etxn => this.fileService.findByTransactionId(etxn.tx.id)),
            map(fileObjs => {
              return (fileObjs && fileObjs.length) || 0;
            })
          ).subscribe((attachments) => {
            this.attachedReceiptsCount = attachments;
          });
        }
      });
  }

  async deleteExpense() {
    const id = this.activatedRoute.snapshot.params.id;

    const popupResult = await this.popupService.showPopup({
      header: 'Delete Expense',
      message: 'Are you sure you want to delete this expense?',
      primaryCta: {
        text: 'DELETE'
      }
    });

    if (popupResult === 'primary') {
      from(this.loaderService.showLoader('Deleting Expense...')).pipe(
        switchMap(() => {
          return this.transactionService.delete(id);
        }),
        finalize(() => from(this.loaderService.hideLoader()))
      ).subscribe(() => {
        if (this.reviewList && this.reviewList.length && +this.activeIndex < this.reviewList.length - 1) {
          this.reviewList.splice(+this.activeIndex, 1);
          this.transactionService.getETxn(this.reviewList[+this.activeIndex]).subscribe(etxn => {
            this.goToTransaction(etxn, this.reviewList, +this.activeIndex);
          });
        } else {
          this.router.navigate(['/', 'enterprise', 'my_expenses']);
        }
      });
    }
  }
}
