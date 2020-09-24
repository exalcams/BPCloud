import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MenuApp, VendorUser, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
import {
  BPVendorOnBoarding, BPIdentity, BPBank, BPVendorOnBoardingView, BPContact,
  QuestionnaireResultSet, Question, QAnswerChoice, Answers, QuestionAnswersView, AnswerList
} from 'app/models/vendor-registration';
import { FuseConfigService } from '@fuse/services/config.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { CBPLocation, CBPIdentity, CBPBank, TaxPayerDetails, StateDetails } from 'app/models/vendor-master';
import { SelectGstinDialogComponent } from '../select-gstin-dialog/select-gstin-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { DISABLED } from '@angular/forms/src/model';

@Component({
  selector: 'vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class VendorRegistrationComponent implements OnInit {


  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  id: string;
  // authenticationDetails: AuthenticationDetails;
  // CurrentUserID: Guid;
  // CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsDisplayPhone2: boolean;
  IsDisplayEmail2: boolean;
  vendorRegistrationFormGroup: FormGroup;
  identificationFormGroup: FormGroup;
  bankDetailsFormGroup: FormGroup;
  contactFormGroup: FormGroup;
  questionFormGroup: FormGroup;
  questionsFormArray = this._formBuilder.array([]);
  // activityLogFormGroup: FormGroup;
  searchText = '';
  AllVendorOnBoardings: BPVendorOnBoarding[] = [];
  selectID: number;
  SelectedBPVendorOnBoarding: BPVendorOnBoarding;
  SelectedBPVendorOnBoardingView: BPVendorOnBoardingView;
  AllQuestionnaireResultSet: QuestionnaireResultSet = new QuestionnaireResultSet();
  AllQuestionAnswersView: QuestionAnswersView[] = [];
  AllQuestions: Question[] = [];
  SelectedQRID: number;
  AllQuestionAnswerChoices: QAnswerChoice[] = [];
  AllQuestionAnswers: Answers[] = [];
  answerList: AnswerList;
  QuestionID: any;
  IdentificationsByVOB: BPIdentity[] = [];
  BanksByVOB: BPBank[] = [];
  ContactsByVOB: BPContact[] = [];

  // ActivityLogsByVOB: BPActivityLog[] = [];
  identificationDisplayedColumns: string[] = [
    'Type',
    'IDNumber',
    'ValidUntil',
    'Attachment',
    'Action'
  ];
  bankDetailsDisplayedColumns: string[] = [
    'IFSC',
    'AccountNo',
    'Name',
    'BankName',
    'City',
    'Branch',
    'Attachment',
    'Action'
  ];
  contactDisplayedColumns: string[] = [
    'Name',
    'Department',
    'Title',
    'Mobile',
    'Email',
    'Action'
  ];
  // activityLogDisplayedColumns: string[] = [
  //   'Activity',
  //   'Date',
  //   'Time',
  //   'Text',
  //   'Action'
  // ];
  identificationDataSource = new MatTableDataSource<BPIdentity>();
  bankDetailsDataSource = new MatTableDataSource<BPBank>();
  contactDataSource = new MatTableDataSource<BPContact>();
  // activityLogDataSource = new MatTableDataSource<BPActivityLog>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild('iDNumber') iDNumber: ElementRef;
  @ViewChild('validUntil') validUntil: ElementRef;
  @ViewChild('accHolderName') accHolderName: ElementRef;
  @ViewChild('accountNo') accountNo: ElementRef;
  @ViewChild('ifsc') ifsc: ElementRef;
  @ViewChild('bankName') bankName: ElementRef;
  @ViewChild('branch') branch: ElementRef;
  @ViewChild('bankCity') bankCity: ElementRef;
  @ViewChild('department') department: ElementRef;
  @ViewChild('title') title: ElementRef;
  @ViewChild('mobile') mobile: ElementRef;
  @ViewChild('email') email: ElementRef;
  @ViewChild('activityDate') activityDate: ElementRef;
  @ViewChild('activityTime') activityTime: ElementRef;
  @ViewChild('activityText') activityText: ElementRef;
  @ViewChild('legalName') legalName: ElementRef;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  Status: string;
  IdentityType: string;
  IdentityValidity: boolean;
  AllIdentities: CBPIdentity[] = [];
  AllIdentityTypes: string[] = [];
  AllRoles: string[] = [];
  AllTypes: string[] = [];
  AllCountries: string[] = [];
  AllStates: StateDetails[] = [];
  math = Math;
  CBPIdentity: CBPIdentity;
  TaxPayerDetails: TaxPayerDetails;
  selected: string;
  selectedCountry: string;
  StateCode: string;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _vendorRegistrationService: VendorRegistrationService,
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };

    this.SelectedBPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoardingView = new BPVendorOnBoardingView();
    // this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.IdentityValidity = false;
    this.Status = '';
    this.AllRoles = ['Vendor', 'Customer'];
    this.selected = this.AllRoles[0];
    this.AllTypes = ['Manufacturer', 'Service Provider', 'Tranporter', 'Others'];
    this.AllIdentityTypes = ['GSTIN'];
    this.AllCountries = ['India'];
    this.selectedCountry = this.AllCountries[0];
    // this.AllStates = [
    //   'ANDAMAN AND NICOBAR ISLANDS',
    //   'ANDHRA PRADESH',
    //   'ARUNACHAL PRADESH',
    //   'ASSAM',
    //   'BIHAR',
    //   'CHANDIGARH',
    //   'CHHATTISGARH',
    //   'DADRA AND NAGAR HAVELI',
    //   'DAMAN AND DIU',
    //   'DELHI',
    //   'GOA',
    //   'GUJARAT',
    //   'HARYANA',
    //   'HIMACHAL PRADESH',
    //   'JAMMU AND KASHMIR',
    //   'JHARKHAND',
    //   'KARNATAKA',
    //   'KERALA',
    //   'LAKSHADWEEP',
    //   'MADHYA PRADESH',
    //   'MAHARASHTRA',
    //   'MANIPUR',
    //   'MEGHALAYA',
    //   'MIZORAM',
    //   'NAGALAND',
    //   'ORISSA',
    //   'PONDICHERRY',
    //   'PUNJAB',
    //   'RAJASTHAN',
    //   'SIKKIM',
    //   'TAMIL NADU',
    //   'TELANGANA',
    //   'TRIPURA',
    //   'UTTARANCHAL',
    //   'UTTAR PRADESH',
    //   'WEST BENGAL',
    //   'UTTARAKHAND'
    // ];
    this.SelectedQRID = 0;
    this.answerList = new AnswerList();
    this.StateCode = '';
  }
  isDisabledDate: boolean = false;
  ngOnInit(): void {

    this.InitializeVendorRegistrationFormGroup();
    this.InitializeIdentificationFormGroup();
    this.InitializeBankDetailsFormGroup();
    this.InitializeContactFormGroup();
    this.GetAllIdentities();
    this.GetAllIdentityTypes();
    this.GetStateDetails();
    // this.GetQuestionnaireResultSet();
    this.InitializeQuestionsFormGroup();
    // this.GetQuestionAnswers();
  }

  GetQuestionnaireResultSet(): void {
    this._vendorRegistrationService.GetQuestionnaireResultSetByQRID().subscribe(
      (data) => {
        this.AllQuestionnaireResultSet = <QuestionnaireResultSet>data;
        this.SelectedQRID = this.AllQuestionnaireResultSet.QRID;
        this.AllQuestions = this.AllQuestionnaireResultSet.Questions;
        // this.AllQuestions.forEach(x => {
        //   this.AddToQuestionsFormGroup(x);
        // });
        this.AllQuestionAnswerChoices = this.AllQuestionnaireResultSet.QuestionAnswerChoices;
        console.log(this.AllQuestionnaireResultSet);
      },
      (err) => {
        console.error(err);
      }
    );
  }
  RoleSelected(event): void {
    if (event.value) {
      const selecteRole = event.value as string;
      this.ClearQuestionFormGroup();
      this.GetQuestionAnswers(selecteRole);
    }
  }
  GetQuestionAnswers(selecteRole: string): void {
    this._vendorRegistrationService.GetQuestionAnswers('BPCloud', selecteRole).subscribe(
      (data) => {
        this.AllQuestionAnswersView = data as QuestionAnswersView[];
        this.AllQuestionAnswersView.forEach(x => {
          this.AddToQuestionsFormGroup(x);
        });
      },
      (err) => {
        console.error(err);
      }
    );
  }

  // AddToQuestionsFormGroup(question: Question): void {
  //   const row = this._formBuilder.group({
  //     quest: ['', Validators.required],
  //   });
  //   this.questionsFormArray.push(row);
  // }
  AddToQuestionsFormGroup(question: QuestionAnswersView): void {
    const row = this._formBuilder.group({
      quest: [question.Answer, Validators.required],
    });
    this.questionsFormArray.push(row);
  }

  onArrowBackClick(): void {
    this._router.navigate(['/auth/login']);
  }

  InitializeVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup = this._formBuilder.group({
      Name: ['', Validators.required],
      Role: ['', Validators.required],
      LegalName: ['', Validators.required],
      AddressLine1: ['', Validators.required],
      AddressLine2: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
      Country: ['', Validators.required],
      PinCode: ['', Validators.required],
      Type: [''],
      Phone1: ['', [Validators.required, Validators.pattern('^[0-9]{2,5}([- ]*)[0-9]{6,8}$')]],
      Phone2: ['', [Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Email1: ['', [Validators.required, Validators.email]],
      Email2: ['', [Validators.email]],
    });
    this.vendorRegistrationFormGroup.get('City').disable();
    this.vendorRegistrationFormGroup.get('State').disable();
    // this.vendorRegistrationFormGroup.get('Country').disable();
  }

  InitializeIdentificationFormGroup(): void {
    this.identificationFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      IDNumber: ['', [Validators.required]],
      ValidUntil: [''],
    });
  }

  AddDynamicValidatorsIdentificationFormGroup(selectedType: string): void {
    const indent = this.AllIdentities.filter(x => x.Text === selectedType)[0];
    if (indent) {
      if (indent.Format) {
        if (selectedType.toLowerCase().includes('gst')) {
          this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern(indent.Format), gstStateCodeValidator(this.StateCode)]);
        } else {
          this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern(indent.Format)]);
        }
      } else {
        if (selectedType.toLowerCase().includes('gst')) {
          this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$'), gstStateCodeValidator(this.StateCode)]);
        } else {
          this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$')]);
        }
      }
    } else {
      if (selectedType.toLowerCase().includes('gst')) {
        this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$'), gstStateCodeValidator(this.StateCode)]);
      } else {
        this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$')]);
      }
    }
    this.identificationFormGroup.get('IDNumber').updateValueAndValidity();
  }

  InitializeBankDetailsFormGroup(): void {
    this.bankDetailsFormGroup = this._formBuilder.group({
      AccountNo: ['', Validators.required],
      Name: ['', Validators.required],
      IFSC: ['', Validators.required],
      BankName: ['', Validators.required],
      Branch: ['', Validators.required],
      City: ['', Validators.required],
    });
  }

  InitializeContactFormGroup(): void {
    this.contactFormGroup = this._formBuilder.group({
      Name: ['', Validators.required],
      Department: ['', Validators.required],
      Title: ['', Validators.required],
      Mobile: ['', [Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Email: ['', [Validators.required, Validators.email]],
    });
  }
  InitializeQuestionsFormGroup(): void {
    this.questionFormGroup = this._formBuilder.group({
      questions: this.questionsFormArray
    });
  }
  // InitializeActivityLogFormGroup(): void {
  //   this.activityLogFormGroup = this._formBuilder.group({
  //     Activity: ['', Validators.required],
  //     Date: ['', Validators.required],
  //     Time: ['', Validators.required],
  //     Text: ['', Validators.required],
  //   });
  // }

  ResetControl(): void {
    this.SelectedBPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoardingView = new BPVendorOnBoardingView();
    this.selectID = 0;
    this.vendorRegistrationFormGroup.reset();
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      this.vendorRegistrationFormGroup.get(key).enable();
      this.vendorRegistrationFormGroup.get(key).markAsUntouched();
    });
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.ClearIdentificationFormGroup();
    this.ClearQuestionFormGroup();
    this.ClearBankDetailsFormGroup();
    this.ClearContactFormGroup();
    // this.ClearActivityLogFormGroup();
    this.ClearQuestionFormGroup();
    this.ClearIdentificationDataSource();
    this.ClearBankDetailsDataSource();
    this.ClearContactDataSource();

  }

  ClearIdentificationFormGroup(): void {
    this.identificationFormGroup.reset();
    Object.keys(this.identificationFormGroup.controls).forEach(key => {
      this.identificationFormGroup.get(key).markAsUntouched();
    });
  }
  ClearQuestionFormGroup(): void {
    this.questionFormGroup.reset();
    Object.keys(this.questionFormGroup.controls).forEach(key => {
      this.questionFormGroup.get(key).markAsUntouched();
    });
    this.ClearFormArray(this.questionsFormArray);
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  ClearBankDetailsFormGroup(): void {
    this.bankDetailsFormGroup.reset();
    Object.keys(this.bankDetailsFormGroup.controls).forEach(key => {
      this.bankDetailsFormGroup.get(key).markAsUntouched();
    });
  }

  ClearContactFormGroup(): void {
    this.contactFormGroup.reset();
    Object.keys(this.contactFormGroup.controls).forEach(key => {
      this.contactFormGroup.get(key).markAsUntouched();
    });
  }


  ClearIdentificationDataSource(): void {
    this.IdentificationsByVOB = [];
    this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
  }

  ClearBankDetailsDataSource(): void {
    this.BanksByVOB = [];
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
  }

  ClearContactDataSource(): void {
    this.ContactsByVOB = [];
    this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
  }

  // ClearActivityLogDataSource(): void {
  //   this.ActivityLogsByVOB = [];
  //   this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  // }

  OpenSelectGstinDialog(): void {
    const dialogConfig: MatDialogConfig = {
      data: 'SelectGstin',
      panelClass: 'select-gstin-dialog'
    };
    const dialogRef = this.dialog.open(SelectGstinDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.GetTaxPayerDetails(result);
      }
    });
  }

  GetTaxPayerDetails(Gstin: any): void {
    // 05AAACG2115R1ZN
    this.IsProgressBarVisibile = true;
    if (Gstin) {
      this._vendorMasterService.GetTaxPayerDetails(Gstin).subscribe(
        (data) => {
          this.TaxPayerDetails = data as TaxPayerDetails;
          if (this.TaxPayerDetails) {
            this.IsProgressBarVisibile = false;
            this.GetLocationDetailsByPincode(this.TaxPayerDetails.pinCode);
            this.vendorRegistrationFormGroup.get('PinCode').patchValue(this.TaxPayerDetails.pinCode);
            this.vendorRegistrationFormGroup.get('LegalName').patchValue(this.TaxPayerDetails.legalName);
            // Address Line 2 value is Pincode or city or state, clear the field 
            // if (taxPayerDetails.address2) {
            //   if (taxPayerDetails.address2.toLowerCase() === taxPayerDetails.pinCode.toLowerCase()) {
            //     this.vendorRegistrationFormGroup.get('AddressLine2').patchValue('');
            //   }
            //   else if (taxPayerDetails.address2.toLowerCase().includes(this.vendorRegistrationFormGroup.get('City').value.toLowerCase())) {
            //     this.vendorRegistrationFormGroup.get('AddressLine2').patchValue('');
            //   }
            //   else {
            //     this.AllStates.forEach(element => {
            //       if (taxPayerDetails.address2.toLowerCase().includes(element.toLowerCase())) {
            //         this.vendorRegistrationFormGroup.get('AddressLine2').patchValue('');
            //       }
            //     });
            //   }
            // }
            this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(this.TaxPayerDetails.address1);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(this.TaxPayerDetails.address2);
            let panCard = '';
            if (this.TaxPayerDetails.gstin) {
              panCard = this.TaxPayerDetails.gstin.substr(2, 10);
              // if (this.AllIdentityTypes) {
              //   this.AllIdentityTypes.forEach(x => {
              //     if (x.toLowerCase() === 'GSTIN') {
              //       this.AddIdentificationToTableFromTaxPayerDetails(this.TaxPayerDetails.gstin, x);
              //     }
              //     else if (x.toLowerCase() === 'Pancard') {
              //       this.AddIdentificationToTableFromTaxPayerDetails(panCard, x);
              //     }
              //   });
              // }
              this.AddIdentificationToTableFromTaxPayerDetails(this.TaxPayerDetails.gstin, 'GSTIN');
              this.AddIdentificationToTableFromTaxPayerDetails(panCard, 'Pancard');
            }
          }
          else {
            this.IsProgressBarVisibile = false;
            this.notificationSnackBarComponent.openSnackBar('Something went wrong while getting gstin details try after some time', SnackBarStatus.danger);
          }
        },
        (err) => {
          this.IsProgressBarVisibile = false;
          console.error(err);
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        }
      );
    }
  }

  AddIdentificationToTableFromTaxPayerDetails(id: string, idType: string): void {
    if (id != null && id !== '') {
      const bPIdentity = new BPIdentity();
      bPIdentity.Type = idType;
      bPIdentity.IDNumber = id;
      // bPIdentity.ValidUntil = 'this.identificationFormGroup.get('ValidUntil').value';
      // if (this.fileToUpload) {
      //   bPIdentity.AttachmentName = this.fileToUpload.name;
      //   this.fileToUploadList.push(this.fileToUpload);
      //   this.fileToUpload = null;
      // }
      if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length) {
        this.IdentificationsByVOB = [];
      }
      this.IdentificationsByVOB.push(bPIdentity);
      this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
    } else {
    }
  }
  GetStateDetails(): void {
    this._vendorMasterService.GetStateDetails().subscribe(
      (data) => {
        this.AllStates = data as StateDetails[];
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAllIdentities(): void {
    this._vendorMasterService.GetAllIdentities().subscribe(
      (data) => {
        this.AllIdentities = data as CBPIdentity[];
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAllIdentityTypes(): void {
    this._vendorMasterService.GetAllIdentityTypes().subscribe(
      (data) => {
        this.AllIdentityTypes = data as string[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetLocationDetailsByPincode(PinCode: any): void {
    if (PinCode) {
      this._vendorMasterService.GetLocationByPincode(PinCode).subscribe(
        (data) => {
          const loc = data as CBPLocation;
          if (loc) {
            this.StateCode = loc.StateCode;
            this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
            // this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
            // this.identificationFormGroup.get('StateCode').patchValue(loc.StateCode);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  GetLocationByPincode(event): void {
    const Pincode = event.target.value;
    if (Pincode) {
      this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const loc = data as CBPLocation;
          if (loc) {
            this.StateCode = loc.StateCode;
            this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
            // this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }
  ValidateIdentityByType(IdentityType: any, ID: any): void {
    if (IdentityType) {
      this._vendorMasterService.ValidateIdentityByType(IdentityType, ID).subscribe(
        (data) => {
          this.CBPIdentity = data as CBPIdentity;
          if (this.CBPIdentity) {
            // this.AddDynamicValidatorsIdentificationFormGroup();
            this.IdentityValidity = false;
            // if (status === 'Matched') {
            //   this.IdentityValidity = false;
            // }
            // else {
            //   this.IdentityValidity = true;
            // }
          } else {
            this.IdentityValidity = true;
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  GetBankByIFSC(event): void {
    const IFSC = event.target.value;
    if (IFSC) {
      this._vendorMasterService.GetBankByIFSC(IFSC).subscribe(
        (data) => {
          const bank = data as CBPBank;
          if (bank) {
            this.bankDetailsFormGroup.get('BankName').patchValue(bank.BankName);
            this.bankDetailsFormGroup.get('Branch').patchValue(bank.BankBranch);
            this.bankDetailsFormGroup.get('City').patchValue(bank.BankCity);
          }
          else {
            this.bankDetailsFormGroup.get('BankName').patchValue('');
            this.bankDetailsFormGroup.get('Branch').patchValue('');
            this.bankDetailsFormGroup.get('City').patchValue('');
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  OnPincodeKeyEnter(event): void {
    this.legalName.nativeElement.focus();
    const Pincode = event.target.value;
    if (Pincode) {
      this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const loc = data as CBPLocation;
          if (loc) {
            this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  OnIFSCKeyEnter(event): void {
    this.ifsc.nativeElement.focus();
    const IFSC = event.target.value;
    if (IFSC) {
      this._vendorMasterService.GetBankByIFSC(IFSC).subscribe(
        (data) => {
          const bank = data as CBPBank;
          if (bank) {
            this.bankDetailsFormGroup.get('BankName').patchValue(bank.BankName);
            this.bankDetailsFormGroup.get('Branch').patchValue(bank.BankBranch);
            this.bankDetailsFormGroup.get('City').patchValue(bank.BankCity);
          }
          else {
            this.bankDetailsFormGroup.get('BankName').patchValue('');
            this.bankDetailsFormGroup.get('Branch').patchValue('');
            this.bankDetailsFormGroup.get('City').patchValue('');
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  OnIdentityClick(IdentityType: any): void {
    this.IdentityType = IdentityType;
  }

  OnIdentityKeyEnter(event): void {
    this.IdentityType = this.identificationFormGroup.get('Type').value;
    this.validUntil.nativeElement.focus();
    // const ID = event.target.value;
    // if (ID) {
    //   this.ValidateIdentityByType(this.IdentityType, ID);
    // }
  }

  keytab(elementName): void {
    switch (elementName) {
      case 'iDNumber': {
        this.iDNumber.nativeElement.focus();
        break;
      }
      case 'validUntil': {
        this.validUntil.nativeElement.focus();
        break;
      }
      case 'accountNo': {
        this.accountNo.nativeElement.focus();
        break;
      }
      case 'accHolderName': {
        this.accHolderName.nativeElement.focus();
        break;
      }
      case 'ifsc': {
        this.ifsc.nativeElement.focus();
        break;
      }
      case 'bankName': {
        this.bankName.nativeElement.focus();
        break;
      }
      case 'branch': {
        this.branch.nativeElement.focus();
        break;
      }
      case 'bankCity': {
        this.bankCity.nativeElement.focus();
        break;
      }
      case 'department': {
        this.department.nativeElement.focus();
        break;
      }
      case 'title': {
        this.title.nativeElement.focus();
        break;
      }
      case 'mobile': {
        this.mobile.nativeElement.focus();
        break;
      }
      case 'email': {
        this.email.nativeElement.focus();
        break;
      }
      case 'activityDate': {
        this.activityDate.nativeElement.focus();
        break;
      }
      case 'activityTime': {
        this.activityTime.nativeElement.focus();
        break;
      }
      case 'activityText': {
        this.activityText.nativeElement.focus();
        break;
      }
      default: {
        break;
      }
    }
  }

  DisplayPhone2(): void {
    this.vendorRegistrationFormGroup.get('Phone2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.vendorRegistrationFormGroup.get('Phone2').updateValueAndValidity();
    this.IsDisplayPhone2 = true;
  }

  DisplayEmail2(): void {
    this.vendorRegistrationFormGroup.get('Email2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.vendorRegistrationFormGroup.get('Email2').updateValueAndValidity();
    this.IsDisplayEmail2 = true;
  }

  loadSelectedBPVendorOnBoarding(selectedBPVendorOnBoarding: BPVendorOnBoarding): void {
    this.ResetControl();
    this.SelectedBPVendorOnBoarding = selectedBPVendorOnBoarding;
    this.selectID = selectedBPVendorOnBoarding.TransID;
    this.EnableAllVendorOnBoardingTypes();
    this.SetBPVendorOnBoardingValues();
    this.GetBPVendorOnBoardingSubItems();
  }

  typeSelected(event): void {
    if (event.value) {
      this.SelectedBPVendorOnBoarding.Type = event.value;
    }
  }

  applyFilter(filterValue: string): void {
    this.identificationDataSource.filter = filterValue.trim().toLowerCase();
  }

  EnableAllVendorOnBoardingTypes(): void {
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      this.vendorRegistrationFormGroup.get(key).enable();
    });
  }

  SetBPVendorOnBoardingValues(): void {
    this.vendorRegistrationFormGroup.get('Name').patchValue(this.SelectedBPVendorOnBoarding.Name);
    this.vendorRegistrationFormGroup.get('Type').patchValue(this.SelectedBPVendorOnBoarding.Type);
    this.vendorRegistrationFormGroup.get('Role').patchValue(this.SelectedBPVendorOnBoarding.Role);
    this.vendorRegistrationFormGroup.get('LegalName').patchValue(this.SelectedBPVendorOnBoarding.LegalName);
    this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(this.SelectedBPVendorOnBoarding.AddressLine1);
    this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(this.SelectedBPVendorOnBoarding.AddressLine1);
    this.vendorRegistrationFormGroup.get('City').patchValue(this.SelectedBPVendorOnBoarding.City);
    this.vendorRegistrationFormGroup.get('State').patchValue(this.SelectedBPVendorOnBoarding.State);
    this.vendorRegistrationFormGroup.get('Country').patchValue(this.SelectedBPVendorOnBoarding.Country);
    this.vendorRegistrationFormGroup.get('Phone1').patchValue(this.SelectedBPVendorOnBoarding.Phone1);
    this.vendorRegistrationFormGroup.get('Phone2').patchValue(this.SelectedBPVendorOnBoarding.Phone2);
    this.vendorRegistrationFormGroup.get('Email1').patchValue(this.SelectedBPVendorOnBoarding.Email1);
    this.vendorRegistrationFormGroup.get('Email2').patchValue(this.SelectedBPVendorOnBoarding.Email2);
    // this.contactFormGroup.get('Email').validator({}as AbstractControl);
  }

  GetBPVendorOnBoardingSubItems(): void {
    this.GetIdentificationsByVOB();
    this.GetBanksByVOB();
    this.GetContactsByVOB();
    // this.GetActivityLogsByVOB();
  }

  GetIdentificationsByVOB(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetIdentificationsByVOB(this.SelectedBPVendorOnBoarding.TransID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.IdentificationsByVOB = data as BPIdentity[];
        this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetBanksByVOB(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetBanksByVOB(this.SelectedBPVendorOnBoarding.TransID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.BanksByVOB = data as BPBank[];
        this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetContactsByVOB(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetContactsByVOB(this.SelectedBPVendorOnBoarding.TransID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.ContactsByVOB = data as BPContact[];
        this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  // GetActivityLogsByVOB(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._vendorRegistrationService.GetActivityLogsByVOB(this.SelectedBPVendorOnBoarding.TransID).subscribe(
  //     (data) => {
  //       this.IsProgressBarVisibile = false;
  //       this.ActivityLogsByVOB = data as BPActivityLog[];
  //       this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.IsProgressBarVisibile = false;
  //       // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //     }
  //   );
  // }
  IdentityTypeSelected(): void {
    const selectedType = this.identificationFormGroup.get('Type').value as string;
    if (selectedType) {
      this.AddDynamicValidatorsIdentificationFormGroup(selectedType);
      if (selectedType.toLowerCase().includes('gst')) {
        this.identificationFormGroup.get('IDNumber').patchValue(this.StateCode);
      }
    }
  }

  AddIdentificationToTable(): void {
    if (this.identificationFormGroup.valid) {
      const bPIdentity = new BPIdentity();
      bPIdentity.Type = this.identificationFormGroup.get('Type').value;
      bPIdentity.IDNumber = this.identificationFormGroup.get('IDNumber').value;
      if (bPIdentity.Type && bPIdentity.Type.toLowerCase().includes('gst')) {
        const id = this.identificationFormGroup.get('IDNumber').value;
        const state_id = id.substring(0, 2);
        const pan_id = id.substring(2, 12);
        if (state_id === this.StateCode) {
          bPIdentity.ValidUntil = this.identificationFormGroup.get('ValidUntil').value;
          if (this.fileToUpload) {
            bPIdentity.AttachmentName = this.fileToUpload.name;
            this.fileToUploadList.push(this.fileToUpload);
            this.fileToUpload = null;
          }
          if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length) {
            this.IdentificationsByVOB = [];
          }
          this.IdentificationsByVOB.push(bPIdentity);
          const bPIdentity_PAN = new BPIdentity();
          bPIdentity_PAN.Type = 'PAN CARD';
          bPIdentity_PAN.IDNumber = pan_id;
          bPIdentity_PAN.ValidUntil = this.identificationFormGroup.get('ValidUntil').value;
          if (this.fileToUpload) {
            bPIdentity.AttachmentName = this.fileToUpload.name;
            this.fileToUploadList.push(this.fileToUpload);
            this.fileToUpload = null;
          }
          this.IdentificationsByVOB.push(bPIdentity_PAN);
          this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
          this.ClearIdentificationFormGroup();
        } else {

        }

      } else {
        bPIdentity.ValidUntil = this.identificationFormGroup.get('ValidUntil').value;
        if (this.fileToUpload) {
          bPIdentity.AttachmentName = this.fileToUpload.name;
          this.fileToUploadList.push(this.fileToUpload);
          this.fileToUpload = null;
        }
        if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length) {
          this.IdentificationsByVOB = [];
        }
        this.IdentificationsByVOB.push(bPIdentity);
        this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
        this.ClearIdentificationFormGroup();
      }

    } else {
      this.ShowValidationErrors(this.identificationFormGroup);
    }
  }

  AddBankToTable(): void {
    if (this.bankDetailsFormGroup.valid) {
      const bPBank = new BPBank();
      bPBank.AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
      bPBank.Name = this.bankDetailsFormGroup.get('Name').value;
      bPBank.IFSC = this.bankDetailsFormGroup.get('IFSC').value;
      bPBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
      bPBank.Branch = this.bankDetailsFormGroup.get('Branch').value;
      bPBank.City = this.bankDetailsFormGroup.get('City').value;
      if (this.fileToUpload) {
        bPBank.AttachmentName = this.fileToUpload.name;
        this.fileToUploadList.push(this.fileToUpload);
        this.fileToUpload = null;
      }
      if (!this.BanksByVOB || !this.BanksByVOB.length) {
        this.BanksByVOB = [];
      }
      this.BanksByVOB.push(bPBank);
      this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
      this.ClearBankDetailsFormGroup();
    } else {
      this.ShowValidationErrors(this.bankDetailsFormGroup);
    }
  }

  AddContactToTable(): void {
    if (this.contactFormGroup.valid) {
      const bPContact = new BPContact();
      bPContact.Name = this.contactFormGroup.get('Name').value;
      bPContact.Department = this.contactFormGroup.get('Department').value;
      bPContact.Title = this.contactFormGroup.get('Title').value;
      bPContact.Mobile = this.contactFormGroup.get('Mobile').value;
      bPContact.Email = this.contactFormGroup.get('Email').value;
      if (!this.ContactsByVOB || !this.ContactsByVOB.length) {
        this.ContactsByVOB = [];
      }
      this.ContactsByVOB.push(bPContact);
      this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
      this.ClearContactFormGroup();
    } else {
      this.ShowValidationErrors(this.contactFormGroup);
    }
  }

  // AddActivityLogToTable(): void {
  //   if (this.activityLogFormGroup.valid) {
  //     const bPActivityLog = new BPActivityLog();
  //     bPActivityLog.Activity = this.activityLogFormGroup.get('Activity').value;
  //     bPActivityLog.Date = this.activityLogFormGroup.get('Date').value;
  //     bPActivityLog.Time = this.activityLogFormGroup.get('Time').value;
  //     bPActivityLog.Text = this.activityLogFormGroup.get('Text').value;
  //     if (!this.ActivityLogsByVOB || !this.ActivityLogsByVOB.length) {
  //       this.ActivityLogsByVOB = [];
  //     }
  //     this.ActivityLogsByVOB.push(bPActivityLog);
  //     this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  //     this.ClearActivityLogFormGroup();
  //   } else {
  //     this.ShowValidationErrors(this.activityLogFormGroup);
  //   }
  // }

  IdentificationEnterKeyDown(): boolean {
    this.validUntil.nativeElement.blur();
    this.AddIdentificationToTable();
    return true;
  }
  QuestionEnterKeyDown(event: any): boolean {
    // this.validUntil.nativeElement.blur();
    this.GetQuestionsAndAnswers(event);
    return true;
  }
  BankEnterKeyDown(): boolean {
    this.bankCity.nativeElement.blur();
    this.AddBankToTable();
    return true;
  }

  ContactEnterKeyDown(): boolean {
    this.email.nativeElement.blur();
    this.AddContactToTable();
    return true;
  }

  // ActivityLogEnterKeyDown(): boolean {
  //   this.activityText.nativeElement.blur();
  //   this.AddActivityLogToTable();
  //   return true;
  // }

  RemoveIdentificationFromTable(bPIdentity: BPIdentity): void {
    const index: number = this.IdentificationsByVOB.indexOf(bPIdentity);
    if (index > -1) {
      this.IdentificationsByVOB.splice(index, 1);
    }
    this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
  }

  RemoveBankFromTable(bPBank: BPBank): void {
    const index: number = this.BanksByVOB.indexOf(bPBank);
    if (index > -1) {
      this.BanksByVOB.splice(index, 1);
    }
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
  }

  RemoveContactFromTable(bPContact: BPContact): void {
    const index: number = this.ContactsByVOB.indexOf(bPContact);
    if (index > -1) {
      this.ContactsByVOB.splice(index, 1);
    }
    this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
  }

  // RemoveActivityLogFromTable(bPActivityLog: BPActivityLog): void {
  //   const index: number = this.ActivityLogsByVOB.indexOf(bPActivityLog);
  //   if (index > -1) {
  //     this.ActivityLogsByVOB.splice(index, 1);
  //   }
  //   this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  // }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Register') {
            this.CreateVendorOnBoarding(Actiontype);
          } else if (Actiontype === 'Save') {
            this.CreateVendorOnBoarding(Actiontype);
          } else if (Actiontype === 'Update') {
            this.CreateVendorOnBoarding(Actiontype);
          } else if (Actiontype === 'Delete') {
            this.DeleteVendorOnBoarding();
          }
        }
      });
  }

  GetBPVendorOnBoardingValues(): void {
    this.SelectedBPVendorOnBoarding.Name = this.SelectedBPVendorOnBoardingView.Name = this.vendorRegistrationFormGroup.get('Name').value;
    this.SelectedBPVendorOnBoarding.Type = this.SelectedBPVendorOnBoardingView.Type = this.vendorRegistrationFormGroup.get('Type').value;
    this.SelectedBPVendorOnBoarding.Role = this.SelectedBPVendorOnBoardingView.Role = this.vendorRegistrationFormGroup.get('Role').value;
    this.SelectedBPVendorOnBoarding.LegalName = this.SelectedBPVendorOnBoardingView.LegalName = this.vendorRegistrationFormGroup.get('LegalName').value;
    this.SelectedBPVendorOnBoarding.AddressLine1 = this.SelectedBPVendorOnBoardingView.AddressLine1 = this.vendorRegistrationFormGroup.get('AddressLine1').value;
    this.SelectedBPVendorOnBoarding.AddressLine2 = this.SelectedBPVendorOnBoardingView.AddressLine2 = this.vendorRegistrationFormGroup.get('AddressLine2').value;
    this.SelectedBPVendorOnBoarding.PinCode = this.SelectedBPVendorOnBoardingView.PinCode = this.vendorRegistrationFormGroup.get('PinCode').value;
    this.SelectedBPVendorOnBoarding.City = this.SelectedBPVendorOnBoardingView.City = this.vendorRegistrationFormGroup.get('City').value;
    this.SelectedBPVendorOnBoarding.State = this.SelectedBPVendorOnBoardingView.State = this.vendorRegistrationFormGroup.get('State').value;
    this.SelectedBPVendorOnBoarding.Country = this.SelectedBPVendorOnBoardingView.Country = this.vendorRegistrationFormGroup.get('Country').value;
    this.SelectedBPVendorOnBoarding.Phone1 = this.SelectedBPVendorOnBoardingView.Phone1 = this.vendorRegistrationFormGroup.get('Phone1').value;
    this.SelectedBPVendorOnBoarding.Phone2 = this.SelectedBPVendorOnBoardingView.Phone2 = this.vendorRegistrationFormGroup.get('Phone2').value;
    this.SelectedBPVendorOnBoarding.Email1 = this.SelectedBPVendorOnBoardingView.Email1 = this.vendorRegistrationFormGroup.get('Email1').value;
    this.SelectedBPVendorOnBoarding.Email2 = this.SelectedBPVendorOnBoardingView.Email2 = this.vendorRegistrationFormGroup.get('Email2').value;
    // this.SelectedBPVendorOnBoarding.VendorCode = this.SelectedBPVendorOnBoardingView.VendorCode = this.vendorRegistrationFormGroup.get('VendorCode').value;
    // this.SelectedBPVendorOnBoarding.ParentVendor = this.SelectedBPVendorOnBoardingView.ParentVendor = this.vendorRegistrationFormGroup.get('ParentVendor').value;
    // this.SelectedBPVendorOnBoarding.Status = this.SelectedBPVendorOnBoardingView.Status = this.vendorRegistrationFormGroup.get('Status').value;

  }

  GetBPVendorOnBoardingSubItemValues(): void {
    this.GetBPIdentityValues();
    this.GetBPBankValues();
    this.GetBPContactValues();
    // this.GetQuestionsAnswers();
    // this.GetBPActivityLogValues();
  }
  ChangeQuestionID(qid: any): void {
    alert(qid);
    this.QuestionID = qid;
  }
  ChangeQuestioncheckBoxID(qid: any, value: any): void {
    const bPIdentity = new Answers();
    bPIdentity.QID = qid;
    bPIdentity.Answer = value;
    bPIdentity.QRID = 1;
    // bPIdentity.QID = this.questionFormGroup.get('QID').value;
    // bPIdentity.Answer = this.questionFormGroup.get('Answer').value;
    console.log(bPIdentity);
    this.AllQuestionAnswers.push(bPIdentity);
    console.log(this.AllQuestionAnswers);
  }
  GetQuestionsAndAnswers(event): void {
    // if (this.questionFormGroup.valid) {
    console.log(event.target.value);
    const bPIdentity = new Answers();
    bPIdentity.QID = this.QuestionID;
    bPIdentity.Answer = event.target.value;
    bPIdentity.QRID = 1;
    // bPIdentity.QID = this.questionFormGroup.get('QID').value;
    // bPIdentity.Answer = this.questionFormGroup.get('Answer').value;
    console.log(bPIdentity);
    this.AllQuestionAnswers.push(bPIdentity);
    console.log(this.AllQuestionAnswers);
    // this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
    // this.ClearQuestionFormGroup();
    // } else {
    //   this.ShowValidationErrors(this.questionFormGroup);
    // }
  }
  GetQuestionsAnswers(userID: Guid): void {
    this.answerList = new AnswerList();
    // this.AllQuestionAnswers = [];
    // this.SelectedBPVendorOnBoardingView.bPIdentities.push(...this.IdentificationsByVOB);
    // this.AllQuestionAnswers.forEach(x => {
    //   this.SelectedBPVendorOnBoardingView.QuestionAnswers.push(x);
    // });
    this.questionsFormArray.controls.forEach((x, i) => {
      const ans: Answers = new Answers();
      ans.QRID = this.AllQuestionAnswersView[i].QRID;
      // ans.QRGID = this.AllQuestionAnswersView[i].QRGID;
      ans.QID = this.AllQuestionAnswersView[i].QID;
      ans.Answer = x.get('quest').value;
      ans.AnsweredBy = userID;
      this.answerList.Answerss.push(ans);
    });
  }
  GetBPIdentityValues(): void {
    this.SelectedBPVendorOnBoardingView.bPIdentities = [];
    // this.SelectedBPVendorOnBoardingView.bPIdentities.push(...this.IdentificationsByVOB);
    this.IdentificationsByVOB.forEach(x => {
      this.SelectedBPVendorOnBoardingView.bPIdentities.push(x);
    });
  }

  GetBPBankValues(): void {
    this.SelectedBPVendorOnBoardingView.bPBanks = [];
    // this.SelectedBPVendorOnBoardingView.BPBanks.push(...this.BanksByVOB);
    this.BanksByVOB.forEach(x => {
      this.SelectedBPVendorOnBoardingView.bPBanks.push(x);
    });
  }

  GetBPContactValues(): void {
    this.SelectedBPVendorOnBoardingView.bPContacts = [];
    // this.SelectedBPVendorOnBoardingView.bPIdentities.push(...this.IdentificationsByVOB);
    this.ContactsByVOB.forEach(x => {
      this.SelectedBPVendorOnBoardingView.bPContacts.push(x);
    });
  }

  // GetBPActivityLogValues(): void {
  //   this.SelectedBPVendorOnBoardingView.bPActivityLogs = [];
  //   // this.SelectedBPVendorOnBoardingView.BPBanks.push(...this.BanksByVOB);
  //   this.ActivityLogsByVOB.forEach(x => {
  //     this.SelectedBPVendorOnBoardingView.bPActivityLogs.push(x);
  //   });
  // }

  CreateVendorOnBoarding(ActionType: string): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    // this.SelectedBPVendorOnBoardingView.CreatedBy = this.authenticationDetails.userID.toString();
    const vendorUser: VendorUser = new VendorUser();
    vendorUser.Email = this.SelectedBPVendorOnBoardingView.Email1;
    vendorUser.Phone = this.SelectedBPVendorOnBoardingView.Phone1;
    this.SelectedBPVendorOnBoardingView.Status = ActionType === 'Save' ? ActionType : 'Open';
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.CreateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        this.SelectedBPVendorOnBoarding.TransID = +(data as BPVendorOnBoarding).TransID;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this._vendorRegistrationService.AddUserAttachment(this.SelectedBPVendorOnBoarding.TransID, this.SelectedBPVendorOnBoarding.Email1, this.fileToUploadList).subscribe(
            () => {
              this._masterService.CreateVendorUser(vendorUser).subscribe(
                (data1) => {
                  const ResultedVendorUser = data1 as UserWithRole;
                  this.GetQuestionsAnswers(ResultedVendorUser.UserID);
                  this._vendorRegistrationService.SaveAnswers(this.answerList).subscribe(
                    () => {
                      this.ResetControl();
                      this.notificationSnackBarComponent.openSnackBar(`Vendor ${ActionType}d successfully`, SnackBarStatus.success);
                      this.IsProgressBarVisibile = false;
                      this._router.navigate(['/auth/login']);
                    },
                    (err) => {
                      this.showErrorNotificationSnackBar(err);
                    });

                  // this.ResetControl();
                  // this.notificationSnackBarComponent.openSnackBar('Vendor registered successfully', SnackBarStatus.success);
                  // this.IsProgressBarVisibile = false;
                  // this._router.navigate(['/auth/login']);
                },
                (err) => {
                  this.showErrorNotificationSnackBar(err);
                });
            },
            (err) => {
              this.showErrorNotificationSnackBar(err);
            }
          );
        } else {
          this._masterService.CreateVendorUser(vendorUser).subscribe(
            (data1) => {
              const ResultedVendorUser = data1 as UserWithRole;
              this.GetQuestionsAnswers(ResultedVendorUser.UserID);
              this._vendorRegistrationService.SaveAnswers(this.answerList).subscribe(
                () => {
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('Vendor registered successfully', SnackBarStatus.success);
                  this.IsProgressBarVisibile = false;
                  this._router.navigate(['/auth/login']);
                },
                (err) => {
                  this.showErrorNotificationSnackBar(err);
                });
            },
            (err) => {
              this.showErrorNotificationSnackBar(err);
            });
        }
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  UpdateVendorOnBoarding(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    this.SelectedBPVendorOnBoardingView.TransID = this.SelectedBPVendorOnBoarding.TransID;
    // this.SelectedBPVendorOnBoardingView.ModifiedBy = this.authenticationDetails.userID.toString();
    this.SelectedBPVendorOnBoardingView.Status = 'Open';
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.UpdateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      () => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor registration updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetAllVendorOnBoardings();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteVendorOnBoarding(): void {
    this.GetBPVendorOnBoardingValues();
    // this.SelectedBPVendorOnBoarding.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.DeleteVendorOnBoarding(this.SelectedBPVendorOnBoarding).subscribe(
      () => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('BPVendorOnBoarding deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetAllVendorOnBoardings();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });

  }

  SaveClicked(choice: string): void {
    if (this.vendorRegistrationFormGroup.valid) {
      // const file: File = this.fileToUpload;
      this.GetBPVendorOnBoardingValues();
      this.GetBPVendorOnBoardingSubItemValues();
      if (choice.toLowerCase() === 'sumbit') {
        if (this.IdentificationsByVOB.length > 0 && this.BanksByVOB.length > 0 && this.ContactsByVOB.length > 0) {
          this.SetActionToOpenConfirmation('Register');
        }
        else {
          this.notificationSnackBarComponent.openSnackBar('Please add atleast one record for BPIdentity,BPBank,BPContact table', SnackBarStatus.danger);
        }
      }
      else {
        this.SetActionToOpenConfirmation('Save');
      }
      // if (this.SelectedBPVendorOnBoarding.Type.toLocaleLowerCase() === 'ui') {
      //   if (this.SelectedBPVendorOnBoardingView.bPIdentities && this.SelectedBPVendorOnBoardingView.bPIdentities.length &&
      //     this.SelectedBPVendorOnBoardingView.bPIdentities.length > 0) {
      //     this.SetActionToOpenConfirmation();
      //   } else {
      //     this.notificationSnackBarComponent.openSnackBar('Please add atleast one record for BPIdentity table', SnackBarStatus.danger);
      //   }
      // } else {
      //   this.SetActionToOpenConfirmation();
      // }
    } else {
      this.ShowValidationErrors(this.vendorRegistrationFormGroup);
    }
  }

  SetActionToOpenConfirmation(Actiontype: string): void {
    if (this.SelectedBPVendorOnBoarding.TransID) {
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  DeleteClicked(): void {
    // if (this.vendorRegistrationFormGroup.valid) {
    if (this.SelectedBPVendorOnBoarding.TransID) {
      const Actiontype = 'Delete';
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
    // } else {
    //   this.ShowValidationErrors(this.vendorRegistrationFormGroup);
    // }
  }

  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      // this.fileToUploadList.push(this.fileToUpload);
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }

  getStatusColor(StatusFor: string): string {
    switch (StatusFor) {
      case 'Start Here':
        return this.Status === 'Open' ? 'gray' : this.Status === 'Approved' ? '#efb577' : '#34ad65';
      case 'Submitted':
        return this.Status === 'Open' ? 'gray' : this.Status === 'Approved' ? 'gray' : this.Status === 'ASN' ? '#efb577' : '#34ad65';
      case 'Completed':
        return this.Status === 'Open' ? 'gray' : this.Status === 'Approved' ? 'gray' : this.Status === 'ASN' ? 'gray' :
          this.Status === 'Gate' ? '#efb577' : '#34ad65';
      default:
        return '';
    }
  }

  getTimeline(StatusFor: string): string {
    switch (StatusFor) {
      case 'Start Here':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Approved' ? 'orange-timeline' : 'green-timeline';
      case 'Submitted':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Approved' ? 'white-timeline' : this.Status === 'ASN' ? 'orange-timeline' : 'green-timeline';
      case 'Completed':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Approved' ? 'white-timeline' : this.Status === 'ASN' ? 'white-timeline' :
          this.Status === 'Gate' ? 'orange-timeline' : 'green-timeline';
      default:
        return '';
    }
  }


  // GetAttachment(fileName: string, file?: File): void {
  //   if (file && file.size) {
  //     const blob = new Blob([file], { type: file.type });
  //     this.OpenAttachmentDialog(fileName, blob);
  //   } else {
  //     this.IsProgressBarVisibile = true;
  //     this._vendorRegistrationService.DowloandBPVendorOnBoardingImage(fileName).subscribe(
  //       data => {
  //         if (data) {
  //           let fileType = 'image/jpg';
  //           fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //             fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //               fileName.toLowerCase().includes('.png') ? 'image/png' :
  //                 fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
  //           const blob = new Blob([data], { type: fileType });
  //           this.OpenAttachmentDialog(fileName, blob);
  //         }
  //         this.IsProgressBarVisibile = false;
  //       },
  //       error => {
  //         console.error(error);
  //         this.IsProgressBarVisibile = false;
  //       }
  //     );
  //   }
  // }
  // OpenAttachmentDialog(FileName: string, blob: Blob): void {
  //   const attachmentDetails: AttachmentDetails = {
  //     FileName: FileName,
  //     blob: blob
  //   };
  //   const dialogConfig: MatDialogConfig = {
  //     data: attachmentDetails,
  //     panelClass: 'attachment-dialog'
  //   };
  //   const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //     }
  //   });
  // }
}

export function gstStateCodeValidator(StateCode: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const gstNo: string = control.value;
    if (!gstNo) {
      return null;
    }
    const state_id = gstNo.substring(0, 2);
    if (state_id === StateCode) {
      return null;
    } else {
      return { 'gstStateCodeError': true };
    }
  };
}

