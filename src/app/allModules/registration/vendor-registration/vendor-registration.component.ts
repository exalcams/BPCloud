import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MenuApp, VendorUser, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MasterService } from 'app/services/master.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
import {
  BPVendorOnBoarding, BPIdentity, BPBank, BPVendorOnBoardingView, BPContact, BPActivityLog,
  QuestionnaireResultSet, Question, QAnswerChoice, Answers, QuestionAnswersView, AnswerList, VendorTokenCheck
} from 'app/models/vendor-registration';
import { FuseConfigService } from '@fuse/services/config.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { CBPLocation, CBPIdentity, CBPBank, TaxPayerDetails, StateDetails, CBPFieldMaster, CBPIdentityFieldMaster, CBPDepartment } from 'app/models/vendor-master';
import { SelectGstinDialogComponent } from '../select-gstin-dialog/select-gstin-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { DISABLED } from '@angular/forms/src/model';
import { FormControl } from '@angular/forms';
import { AttachmentDetails } from 'app/models/attachment';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { remove } from 'lodash';
import { PhoneDilaogComponent } from '../phone-dilaog/phone-dilaog.component';
import { InformationDialogComponent } from 'app/notifications/information-dialog/information-dialog.component';
import { saveAs } from 'file-saver';
import { element } from 'protractor';

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
  Departments: any[] = [];
  SelectedMenuApp: MenuApp;
  id: string;
  today: Date = new Date();
  DeptValue="";
  // authenticationDetails: AuthenticationDetails;
  // CurrentUserID: Guid;
  // CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsDisplayPhone2: boolean;
  IsDisplayEmail2: boolean;
  hiddenoption: boolean = false;
  vendorRegistrationFormGroup: FormGroup;
  identificationFormGroup: FormGroup;
  bankDetailsFormGroup: FormGroup;
  contactFormGroup: FormGroup;
  questionFormGroup: FormGroup;
  questionsFormArray = this._formBuilder.array([]);
  activityLogFormGroup: FormGroup;
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
  CBPIdentity: CBPIdentityFieldMaster[] = [];
  MSMEMandatory = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  IdentityRowSelectedIndex = null;
  GSTStatusCode: any;
  VendorType = '';
  ActivityLogsByVOB: BPActivityLog[] = [];
  identificationDisplayedColumns: string[] = [
    'firstcolumn',
    'Type',
    // 'Option',
    // 'IDNumber',
    'ValidUntil',
    'Attachment',
    // 'Action'
  ];
  bankDetailsDisplayedColumns: string[] = [
    'firstcolumn',
    'IFSC',
    'AccountNo',
    'Name',
    'BankName',
    'City',
    'Branch',
    // 'Attachment',
    'Action'
  ];
  contactDisplayedColumns: string[] = [
    'firstcolumn',
    'Name',
    'Department',
    'Title',
    'Mobile',
    'Email',
    'Action'
  ];
  activityLogDisplayedColumns: string[] = [
    'firstcolumn',
    'Activity',
    'Date',
    'Time',
    'Text',
    'Action'
  ];
  SelectedIdentity: BPIdentity;
  SelectedBank: BPBank;
  identificationDataSource = new MatTableDataSource<BPIdentity>();
  bankDetailsDataSource = new MatTableDataSource<BPBank>();
  contactDataSource = new MatTableDataSource<BPContact>();
  activityLogDataSource = new MatTableDataSource<BPActivityLog>();
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

  @ViewChild('fileInput1') fileInput: ElementRef<HTMLElement>;
  @ViewChild('fileInput2') fileInput2: ElementRef<HTMLElement>;
  fileToUpload: File;
  fileToUpload1: File;
  fileToUploadList: File[] = [];
  Status: string;
  IdentityType: string;
  IdentityValidity: boolean;
  AllIdentities: CBPIdentity[] = [];
  AllIdentityTypes: any[] = [];
  AllRoles: string[] = [];
  TypeofIndustryTypes: any[] = [];
  AllCountries: any[] = [];
  lanline: any[] = []
  pincode: any[] = []
  GSTNumber = "";
  MSMETypes: any[] = [];
  myControl = new FormControl();
  myControl1 = new FormControl();
  myControl2 = new FormControl();
  filteredOptions: Observable<any[]>;
  AllStates: StateDetails[] = [];
  statecontrol = new FormControl();
  filteredstate: Observable<StateDetails[]>;
  math = Math;
  BPVendorOnBoarding: BPVendorOnBoarding;
  // CBPIdentity: CBPIdentity;
  TaxPayerDetails: TaxPayerDetails;
  StateCode: string;
  Country: string;
  Phone1_ng: any;
  Phone2_ng: any;
  Title: string;
  confirmvalue: any;
  index: number;
  inputvalue = '';
  emailvalue = '';
  codeselected = '';
  AllOnBoardingFieldMaster: CBPFieldMaster[] = [];
  type_option: any;
  len: any;
  phone1: any;
  phone1_error: string;
  i: any;
  pin_first: any;
  pin_first1: any = [];
  n: number;
  j: any;
  n1: any;
  result: any;
  dialogRef: any;
  result1: any;
  result2: any;
  filteredlandline: Observable<any[]>;
  filteredlandline1: Observable<any[]>;
  land_num: any;
  land_num1: any;
  count1: any = 0;
  contactDetailsIndex: any;
  bankChangeIndex: any;
  addressline1: any[] = [];
  Postaldata: any;
  ShowAddIdentityButton = false;
  VendorTokenCheck: VendorTokenCheck;
  initialIdentity: boolean;
  InitialBank = false;
  GSTDisable = false;
  InitialContact: boolean;
  EmamiContactPerson: string;
  EmamiContactPersonMail: string;
  GSTCheckBox = false;
  PanEnable = false;
  ProcessRequest = false;
  AllDepartments: CBPDepartment[];
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _vendorRegistrationService: VendorRegistrationService,
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialog1: MatDialog,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private el: ElementRef,
    private route: ActivatedRoute
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

    // this.hiddenoption=false;

    // this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.IdentityValidity = false;
    this.Status = '';
    this.AllRoles = ['Vendor', 'Customer'];
    this.TypeofIndustryTypes = [
      "Manufacturing",
      "Services",
      "Trading"
    ];

    this.Country = "India"

    this.SelectedQRID = 0;
    this.answerList = new AnswerList();
    this.StateCode = '';
    this.SelectedIdentity = new BPIdentity();
    this.SelectedBank = new BPBank();
    this.MSMETypes = [
      "Not Applicable",
      "Micro Enterprise",
      "Small Enterprise",
      "Medium Enterprise"
    ]
  }
  isDisabledDate: boolean = false;
  checked = false;
  indeterminate = false;
  labelPosition = 'before';
  disabled = false;
  MSMERow: BPIdentity;
  ngOnInit(): void {
    this.BPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoardingView = new BPVendorOnBoardingView();
    this.MSMERow = new BPIdentity();
    this.InitializeVendorRegistrationFormGroup();
    this.GetAllOnBoardingFieldMaster();
    this.InitializeIdentificationFormGroup();
    this.InitializeBankDetailsFormGroup();
    this.InitializeContactFormGroup();
    this.InitializeActivityLogFormGroup();
    this.GetAllIdentities();
    // this.GetAllIdentityTypes();
    this.GetStateDetails();
    // this.GetQuestionnaireResultSet();
    this.InitializeQuestionsFormGroup();
    // this.GetQuestionAnswers();
    // this.filteredOptions = this.myControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => this._filter(value))
    //   );

    this.filteredstate = this.statecontrol.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterstate(value))
      );
    this.filteredlandline = this.myControl1.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterlandline(value))
      );
    this.filteredlandline1 = this.myControl2.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterlandline1(value))
      );
    this.VendorTokenCheck = new VendorTokenCheck();
    this.route.queryParams.subscribe(params => {
      this.VendorTokenCheck.token = params['token'];
      this.VendorTokenCheck.transID = params['Id'];
      this.VendorTokenCheck.emailAddress = params['Email'];
    });
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.CheckTokenValidity(this.VendorTokenCheck).subscribe(
      (data) => {
        console.log('Token Validatiy', data);
        if (data) {
          this._vendorRegistrationService.GetVendorOnBoardingsByID(this.VendorTokenCheck.transID).subscribe(
            (Userdata) => {
              const Vendor = Userdata as BPVendorOnBoardingView;
              this.BPVendorOnBoarding = Vendor;
              this.EmamiContactPerson = this.BPVendorOnBoarding.EmamiContactPerson;
              this.EmamiContactPersonMail = this.BPVendorOnBoarding.EmamiContactPersonMail;
              const MSMEType = Vendor.MSME_TYPE;

              if (MSMEType === "MIC") {
                this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Micro Enterprise");
              } else if (MSMEType === "SML") {
                this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Small Enterprise");
              } else if (MSMEType === "MID") {
                this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Medium Enterprise");
              }
              else {
                this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Not Applicable");
              }
              console.log('BPVendorOnBoardingView', Vendor);
              if (Vendor.Type === '01') {
                this.VendorType = 'Domestic Supply';
              }
              else if (Vendor.Type === '02') {
                this.VendorType = 'Domestic Service';
              }
              else if (Vendor.Type === '03') {
                this.VendorType = 'Import Vendor';
                this.GSTDisable = true;
                this.vendorRegistrationFormGroup.get('GSTNumber').disable();
                this.vendorRegistrationFormGroup.get('PAN').disable();
              }
              else if (Vendor.Type === 'Domestic Service') {
                this.VendorType = 'Domestic Service';
              }
              else if (Vendor.Type === 'Domestic Supply') {
                this.VendorType = 'Domestic Supply';
              }
              else if (Vendor.Type === 'Import Vendor') {
                this.VendorType = 'Import Vendor';
                this.GSTDisable = true;
                this.vendorRegistrationFormGroup.get('GSTNumber').disable();
                this.vendorRegistrationFormGroup.get('PAN').disable();
              }
              this.vendorRegistrationFormGroup.get('Name').patchValue(Vendor.Name);
              this.vendorRegistrationFormGroup.get('LegalName').patchValue(Vendor.LegalName);
              this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(Vendor.AddressLine1);
              this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(Vendor.AddressLine2);
              this.vendorRegistrationFormGroup.get('PinCode').patchValue(Vendor.PinCode);
              this.vendorRegistrationFormGroup.get('City').patchValue(Vendor.City);
              this.vendorRegistrationFormGroup.get('State').patchValue(Vendor.State);
              this.vendorRegistrationFormGroup.get('Country').patchValue(Vendor.Country);
              this.vendorRegistrationFormGroup.get('Phone1').patchValue(Vendor.Phone1);
              this.vendorRegistrationFormGroup.get('Phone2').patchValue(Vendor.Phone2);
              this.vendorRegistrationFormGroup.get('Email1').patchValue(Vendor.Email1);
              this.vendorRegistrationFormGroup.get('Email2').patchValue(Vendor.Email2);
              this.vendorRegistrationFormGroup.get('GSTNumber').patchValue(Vendor.GSTNumber);

              // this.contactFormGroup.get('Department').disable();

              if (Vendor.AddressLine1 != null) {
                // this.vendorRegistrationFormGroup.get('AddressLine1').disable();
              }
              if (Vendor.AddressLine2 != null) {
                this.vendorRegistrationFormGroup.get('AddressLine2').disable();
              }
              if (Vendor.PinCode != null) {
                this.vendorRegistrationFormGroup.get('PinCode').disable();

              }
              if (Vendor.City != null) {
                this.vendorRegistrationFormGroup.get('City').disable();
              }
              if (Vendor.State != null) {
                this.vendorRegistrationFormGroup.get('State').disable();
              }
              if (Vendor.Country != null) {
                this.vendorRegistrationFormGroup.get('Country').disable();
              }

              if (Vendor.GSTStatus === "true") {
                this.PanEnable = false;
                this.vendorRegistrationFormGroup.get('PAN').disable();
                this.vendorRegistrationFormGroup.get('GSTNumber').enable();

              } else {
                if (Vendor.GSTStatus != null) {
                  this.PanEnable = true;
                  this.vendorRegistrationFormGroup.get('PAN').enable();
                  this.vendorRegistrationFormGroup.get('GSTNumber').disable();
                }
              }
              let Department;
              this._vendorRegistrationService.GetContactsByVOB(this.VendorTokenCheck.transID).subscribe(
                (Contact) => {
                  this._vendorMasterService.GetAllDepartments().subscribe(
                    (data) => {
                      // this.contactFormGroup.get('Department').patchValue(Vendor.Department);

                      Department = data as CBPDepartment[];
                      this.AllDepartments = data as CBPDepartment[];
                      this.AllDepartments.forEach(element => {
                        let text = element.Department + " " + element.Text;
                        this.Departments.push(text);
                      });

                      this.Departments.forEach(dept => {
                        let text=dept as string;
                        if(text.includes(Vendor.Department))
                        {
                          this.DeptValue=text;
                          this.contactFormGroup.get('Department').patchValue(text);
                        }
                      });
                    }
                  );
                  let con = Contact as BPContact[];
                  if (con.length >= 1) {
                    this.InitialContact = false;
                    this.ContactsByVOB = Contact as BPContact[];
                    this._vendorMasterService.GetAllDepartments().subscribe(
                      (data) => {
                        Department = data as CBPDepartment[];
                        this.AllDepartments = data as CBPDepartment[];
                        this.ContactsByVOB.forEach((contact, index) => {
                          this.AllDepartments.forEach(Dept => {
                            let text = Dept.Department + " " + Dept.Text;
                            this.Departments.push(text);
                            if (contact.Department === Dept.Department) {
                              this.ContactsByVOB[index].Department = Dept.Department + " " + Dept.Text;
                            }
                          });
                        });
                      }
                    );
                    this.contactDataSource = new MatTableDataSource<BPContact>(this.ContactsByVOB);
                  }
                }
              );
              this._vendorRegistrationService.GetBanksByVOB(this.VendorTokenCheck.transID).subscribe(
                (bank) => {
                  let b = bank as BPBank[];
                  if (b.length >= 1) {
                    this.BanksByVOB = bank as BPBank[];
                    this.InitialBank = false;
                    this.bankDetailsDataSource = new MatTableDataSource<BPBank>(this.BanksByVOB);
                  }
                }
              );
              this._vendorRegistrationService.GetIdentificationsByVOB(this.VendorTokenCheck.transID).subscribe(
                (identity) => {
                  let iden = identity;
                  console.log('BPIdentity', iden);
                  if (iden.length >= 1) {
                    this.IdentificationsByVOB = identity as BPIdentity[];
                    console.log("IdentificationsByVOB", this.IdentificationsByVOB);
                    // console.log('IdentificationsByVOB', this.IdentificationsByVOB)
                    this.GetAllIdentityTypes();
                    this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
                  }
                  else {
                    console.log('GetAllIdentityTypes Called');
                    this.GetAllIdentityTypes();
                  }
                }
              );
              console.log('this.VendorType', this.VendorType);
            }
          );
          this.IsProgressBarVisibile = false;
        }
        else {
          this.openSnackBar('Token might have already used or wrong token', SnackBarStatus.danger, 6000);
          this.IsProgressBarVisibile = false;
          console.log('Else');
          // this.router.navigate(['/auth/login']);

        }
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.log('Err', err);
        this.openSnackBar('Token might have already used or wrong token', SnackBarStatus.danger, 6000);
        // this.router.navigate(['/auth/login']);

      }
    );
    //  const toooo =too.length;

    //  tooo.reverse();
    //  const tr=tooo;
    //  console.log(tr);

    //  if(token){
    //   const changevale =[];
    //     for(let i=0; token.length>=0;i--){
    //       changevale.push(token[i]);
    //       console.log(changevale);
    //     }
    //  }

  }
  private _filterlandline(value: string): any {
    const filterValue1 = value.toLowerCase();
    console.log("landline below")
    console.log(this.lanline.filter(landline => landline.num.indexOf(filterValue1) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue1) === 0);

  }
  private _filterlandline1(value: string): any {
    const filterValue2 = value.toLowerCase();
    // console.log("landline below")
    console.log(this.lanline.filter(landline => landline.num.indexOf(filterValue2) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue2) === 0);

  }
  // private _filter(value: any): any[] {
  //   const filterValue = value.toLowerCase();

  //   // console.log("filter" + this.AllCountries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0));
  //   return this.AllCountries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
  // }
  phonelandline() {

  }

  private _filterstate(value: any): any[] {
    const filterValuestate = value.toLowerCase();

    return this.AllStates.filter(sta => sta.State.toLowerCase().indexOf(filterValuestate) === 0);
  }
  // reverseNum(to) {
  //     return (
  //       parseFloat(
  //         to
  //           .toString()
  //           .split('')
  //           .reverse()
  //           .join('')
  //       )

  //     ) 
  //   //  console.log(to.split());
  //       }
  // console.log(reverseNum(to));
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
  landlinefunc(num) {
    console.log("num" + num)
    console.log("mycontrol" + this.myControl1.get("landline.num"));

    this.land_num = num;
    //  this.vendorRegistrationFormGroup.get('Phone1').markAsTouched();
  }
  landlinefunc1(num) {
    console.log("num" + num)
    console.log("mycontrol2" + this.myControl2.get("landline.num"));

    this.land_num1 = num;
    //  this.vendorRegistrationFormGroup.get('Phone1').markAsTouched();
  }
  // CountrySelect(event):void{
  //   if(event.value){
  //     const countrytype =event.value as string;
  //     if(countrytype && countrytype ==="India"){
  //       this.vendorRegistrationFormGroup.get('Country').disable();
  //     this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
  //     }
  //   }
  // }
  // countryfunc(){
  //   // console.log(event);
  //   // console.log("country:"+this.Country)
  //   if(this.Country=="India"){
  //    this.vendorRegistrationFormGroup.get("Country").markAsTouched();
  //   // this.vendorRegistrationFormGroup.get('Country').patchValue("");
  //   }
  // }
  Countrycodefunc(country) {


    console.log("country:" + country);
    this.codeselected = country.countycode
    console.log(this.codeselected)
  }
  typefunc(type) {
    console.log(type);
    this.type_option = type.Key;
    if ((type.Key == "Domestic Supply") || (type.Key == "Domestic Service")) {
      this.codeselected = "+91"
    }
  }

  onKey(event: any) {
    this.inputvalue = event.target.value;
    console.log(this.inputvalue, "asas");
    if (this.inputvalue.toLowerCase() === "india") {
      this.notificationSnackBarComponent.openSnackBar(`India is not Acceptable,Please Change the Country`, SnackBarStatus.danger, 6000);
    }
  }
  Emailvalue(event: any) {
    this.emailvalue = event.target.value;
    if (this.vendorRegistrationFormGroup.get('Email1').value === this.emailvalue) {
      this.notificationSnackBarComponent.openSnackBar(`Email is duplicate record`, SnackBarStatus.danger, 5000);
    }

  }
  // OptionSelected(event): void {
  //   if (event.value) {
  //     const selecteoption = event.value as string;
  //     if (selecteoption && selecteoption === 'MSME Registered') {
  //       this.hiddenoption = true;
  //       this.identificationFormGroup.get('Option').enable();
  //       this.AllOption = [
  //         'Micro',
  //         'Small',
  //         'Medium'
  //       ]
  //     } else if (selecteoption && selecteoption === 'Annual Revenue') {
  //       this.hiddenoption = true;
  //       this.identificationFormGroup.get('Option').enable();
  //       this.AllOption = ['<100 cr INR', '100-200 cr INR', '200-300 cr INR', '300-500 cr INR', '500-100 cr INR', '1000-2000 cr INR', '>2000 cr INR']

  //     } else if (selecteoption && selecteoption === 'Employee Strength') {
  //       this.hiddenoption = true;
  //       this.identificationFormGroup.get('Option').enable();
  //       this.AllOption = ['<500', '500-1000', '1000-5000', '5000-10000', '>10000']
  //     } else if (selecteoption && selecteoption === 'Legal Structure / Form of Business') {
  //       this.hiddenoption = true;
  //       this.identificationFormGroup.get('Option').enable();
  //       this.AllOption = ['Public Limited Company(listed)', 'Public Limited Company(not listed)', 'Private Limited Company', 'Patnership', 'Sole Proprietorship', 'LLP']
  //     }
  //     else {
  //       this.hiddenoption = false;
  //       this.identificationFormGroup.get('Option').disable();
  //       this.identificationFormGroup.get('Option').patchValue('_____NIL_____');
  //     }
  //   }

  // }
  CountrySelected(val: string): void {
    if (val) {
      this.vendorRegistrationFormGroup.get('PinCode').patchValue('');
      this.vendorRegistrationFormGroup.get('City').patchValue('');
      this.vendorRegistrationFormGroup.get('State').patchValue('');
      this.vendorRegistrationFormGroup.get('AddressLine1').patchValue('');
      this.vendorRegistrationFormGroup.get('AddressLine2').patchValue('');
    }
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
      Name: ['', [Validators.required, Validators.maxLength(40)]],
      // Role: ['Vendor', Validators.required],
      PAN: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      GSTNumber: ['', [Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')]],
      LegalName: ['', [Validators.required, Validators.maxLength(40)]],
      // WebsiteAddress: [''],
      AddressLine1: ['', Validators.required],
      MSMEType: ['Not Applicable', Validators.required],
      TypeOfIndustry: ['',],
      AddressLine2: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
      Country: ['India', [Validators.required]],
      // ,this.countryDomain
      PinCode: ['', [Validators.required, Validators.pattern('^\\d{4,10}$')]],
      Type: [''],
      // Invoice: [''],
      Phone1: ['', [Validators.required, Validators.maxLength(15), Validators.pattern("^[0-9]{7,15}$")]],
      Phone2: ['', [Validators.maxLength(15), Validators.pattern("^[0-9]{7,15}$")]],

      Email1: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      Email2: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],

    });
    // this.vendorRegistrationFormGroup.get('City').disable();
    // this.vendorRegistrationFormGroup.get('State').disable();
    // this.vendorRegistrationFormGroup.get('Country').disable();
  }
  phoneDomain1(control: AbstractControl): { [key: string]: any } | null {
    const phone: any = control.value.toString();//to find the length converted as string
    if (phone && phone.length > 15) {
      return { 'phoneNumberInvalid': true };
    }
    else {
      return null;
    }
  }
  phone1_dialog() {
    if (this.count1 == 0) {
      this.dialogRef = this.dialog1.open(PhoneDilaogComponent);
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.GetTaxPayerDetails(result);
          console.log("result final" + result)
          if (result == 1) {
            this.result1 = "Moblile"
          }
          else if (result == 2) {
            this.result1 = "Landline"
          }
        }
        else if (!result) {

          // this.notificationSnackBarComponent.openSnackBar(`Please enter Valid GSTIN`, SnackBarStatus.danger, 5000);
        }
      });
      // console.log("hii");
    }
  }
  phone1_dialog1() {
    if (this.count1 == 0) {
      this.dialogRef = this.dialog1.open(PhoneDilaogComponent);
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.GetTaxPayerDetails(result);
          console.log("result final" + result)
          if (result == 1) {
            this.result2 = "Moblile"
          }
          else if (result == 2) {
            this.result2 = "Landline"
          }
        }
        else if (!result) {

          // this.notificationSnackBarComponent.openSnackBar(`Please enter Valid GSTIN`, SnackBarStatus.danger, 5000);
        }
      });
      // console.log("hii");
    }
  }
  pinfunc() {
    this.j = 0
    this.n1 = this.pincode.length
    this.pin_first1 = this.vendorRegistrationFormGroup.get('PinCode').value;
    this.pin_first = this.pin_first1.slice(0, 1)
    this.pin_first = Number(this.pin_first)
    // this.pin_first=this.pin_first
    for (this.j; this.j < this.n1; this.j++) {
      if (this.pincode[this.j].num == this.pin_first1 && this.type_option == "Import") {
        this.vendorRegistrationFormGroup.get('PinCode').markAsTouched();
        this.vendorRegistrationFormGroup.controls['PinCode'].setErrors({ 'incorrect': true });

      }
    }
  }
  countryDomain(control: AbstractControl): { [key: string]: any } | null {
    // this.countryfunc();
    const country: any = control.value;

    if (country && country == "India") {

      return { 'countryInvalid': true };

    }
    else {
      return null;
    }
  }
  public static ThreeNumbers(control: FormControl) {
    if (control.value.length < 3 && typeof control.value !== 'number') {
      return { 'greater than 3 numbers': true };
    }
    return null;
  }
  countryfunc() {
    // console.log(event);
    // console.log("country:"+this.Country)
    const country = this.Country.toLocaleLowerCase()

    if (country == "india" && this.type_option == "Import") {

      this.vendorRegistrationFormGroup.get("Country").markAsTouched();
      this.vendorRegistrationFormGroup.controls['Country'].setErrors({ 'incorrect': true });
      // this.vendorRegistrationFormGroup.get('Country').patchValue("");
    }
  }
  phoneDomain() {
    // const phone:any=this.Phone1_ng.value;//to find the length converted as string
    // const phone:any=this.Phone1_ng.value.toString();//to find the length converted as string
    // =
    this.len = this.Phone1_ng.length;
    console.log(this.len)
    if (this.Phone1_ng && this.len > 15) {
      // this.vendorRegistrationFormGroup.get("Phone1").markAsTouched();
      this.vendorRegistrationFormGroup.controls['Phone1'].setErrors({ 'incorrect': true });
      this.phone1_error = "only 15 number is allowed";
    }
  }
  InitializeIdentificationFormGroup(): void {
    this.identificationFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      Option: [''],
      IDNumber: [''],
      ValidUntil: [''],
    });
    this.InitializeIdentificationTable();
    this.identificationFormGroup.get('Option').disable();
    // this.identificationFormGroup.get('Type').disable();

  }

  InitializeIdentificationTable(): void {
    const bPIdentity = new BPIdentity();
    // this.IdentificationsByVOB.push(bPIdentity);
    // this.IdentificationsByVOB.push(bPIdentity);
    this.initialIdentity = true;
    this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
  }

  // AddDynamicValidatorsIdentificationFormGroup(selectedType: string): void {
  //   console.log('AddDynamicValidatorsIdentificationFormGroup');
  //   const indent = this.AllIdentities.filter(x => x.Text === selectedType)[0];
  //   if (indent) {
  //     if (indent.Format) {
  //       if (selectedType.toLowerCase().includes('gst')) {
  //         this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern(indent.Format), gstStateCodeValidator(this.StateCode)]);
  //       } else {
  //         this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern(indent.Format)]);
  //       }
  //     } else {
  //       if (selectedType.toLowerCase().includes('gst')) {
  //         this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$'), gstStateCodeValidator(this.StateCode)]);
  //       } else {
  //         this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$')]);
  //       }
  //     }
  //   } else {
  //     if (selectedType.toLowerCase().includes('gst')) {
  //       this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$'), gstStateCodeValidator(this.StateCode)]);
  //     } else {
  //       this.identificationFormGroup.get('IDNumber').setValidators([Validators.required, Validators.pattern('^.*$')]);
  //     }
  //   }
  //   this.identificationFormGroup.get('IDNumber').updateValueAndValidity();
  // }

  InitializeBankDetailsFormGroup(): void {
    this.bankDetailsFormGroup = this._formBuilder.group({
      AccountNo: ['', Validators.required],
      Name: ['', Validators.required],
      IFSC: ['', [Validators.required, Validators.pattern("^[A-Z]{4}0[A-Z0-9]{6}$")]],
      BankName: ['', Validators.required],
      Branch: ['', Validators.required],
      City: ['', Validators.required],
    });
    this.InitializeBankDetailsTable();
  }
  InitializeBankDetailsTable(): void {
    const bPIdentity = new BPBank();
    this.InitialBank = true;
    this.BanksByVOB.push(bPIdentity);
    this.BanksByVOB.push(bPIdentity);
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
  }
  InitializeContactFormGroup(): void {
    this.contactFormGroup = this._formBuilder.group({
      Name: ['', Validators.required],
      Department: ['', Validators.required],
      Title: ['', Validators.required],
      Mobile: ['', [Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    });
    this.InitializeContactTable();
  }
  InitializeContactTable(): void {
    const bPIdentity = new BPContact();
    this.InitialContact = true;
    this.ContactsByVOB.push(bPIdentity);
    this.ContactsByVOB.push(bPIdentity);
    this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
  }
  InitializeQuestionsFormGroup(): void {
    this.questionFormGroup = this._formBuilder.group({
      questions: this.questionsFormArray
    });
  }
  InitializeActivityLogFormGroup(): void {
    this.activityLogFormGroup = this._formBuilder.group({
      Activity: ['', Validators.required],
      Date: ['', Validators.required],
      Time: ['', Validators.required],
      Text: ['', Validators.required],
    });
    this.InitializeActivityTable();
  }
  InitializeActivityTable(): void {
    const bpactivitylog = new BPActivityLog();
    this.ActivityLogsByVOB.push(bpactivitylog);
    this.ActivityLogsByVOB.push(bpactivitylog);
    this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  }

  ResetControl(): void {
    this.SelectedBPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoardingView = new BPVendorOnBoardingView();
    this.selectID = 0;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.fileToUpload = null;
    this.fileToUpload1 = null;
    this.fileToUploadList = [];
    this.ResetVendorRegistrationFormGroup();
    this.InitializeVendorRegistrationFormGroupByFieldMaster();
    this.ClearIdentificationFormGroup();
    this.ClearQuestionFormGroup();
    this.ClearBankDetailsFormGroup();
    this.ClearContactFormGroup();
    this.ClearActivityLogFormGroup();
    this.ClearQuestionFormGroup();
    this.ClearIdentificationDataSource();
    this.ClearBankDetailsDataSource();
    this.ClearContactDataSource();

  }
  ResetVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup.reset();
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      this.vendorRegistrationFormGroup.get(key).enable();
      this.vendorRegistrationFormGroup.get(key).markAsUntouched();
    });
  }
  SetInitialValueForVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup.get('Role').patchValue('Vendor');
    this.vendorRegistrationFormGroup.get('Country').patchValue('India');
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
  ClearVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup.reset();
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      this.vendorRegistrationFormGroup.get(key).markAsUntouched();
    });
  }
  ClearActivityLogFormGroup(): void {
    this.activityLogFormGroup.reset();
    Object.keys(this.activityLogFormGroup.controls).forEach(key => {
      this.activityLogFormGroup.get(key).markAsUntouched();
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

  ClearActivityLogDataSource(): void {
    this.ActivityLogsByVOB = [];
    this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  }

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
      else if (!this.GetTaxPayerDetails) {
        this.notificationSnackBarComponent.openSnackBar(`Please enter Valid GSTIN`, SnackBarStatus.danger, 5000);
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
            this.vendorRegistrationFormGroup.get('Name').patchValue(this.TaxPayerDetails.legalName);
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
              this.AddIdentificationToTableFromTaxPayerDetails(panCard, 'PAN CARD');
            }
            if (!this.TaxPayerDetails) {
              this.notificationSnackBarComponent.openSnackBar('Something went gone', SnackBarStatus.danger, 5000);
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
      if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length || !this.IdentificationsByVOB[0].Type) {
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
    this._vendorMasterService.GetAllIdentityFields().subscribe(
      (data) => {
        this.CBPIdentity = data as CBPIdentityFieldMaster[];
        console.log('GetAllIdentityFields', this.CBPIdentity);
      });
    this._vendorMasterService.GetAllIdentityTypes().subscribe(
      (data) => {
        this.AllIdentityTypes = data as string[];
        if (this.GSTDisable) {
          this.AllIdentityTypes.forEach((types, index) => {
            const stingType = types as string;
            if (stingType.includes('GST')) {
              this.AllIdentityTypes.splice(index, 1);
            }
            if (stingType.includes('PAN')) {
              this.AllIdentityTypes.splice(index, 1);
            }
          });
        }
        if (this.IdentificationsByVOB.length === 0) {
          this.AllIdentityTypes.forEach((type, index) => {
            const Identity = new BPIdentity();
            Identity.Type = type;
            this.IdentificationsByVOB.push(Identity);
          });
          this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
        }
        if (this.vendorRegistrationFormGroup.get('MSMEType').value === "Not Applicable") {
          this.AllIdentityTypes.forEach((type, index) => {
            if (type === "MSME Certificate") {
              this.AllIdentityTypes.splice(index, 1);
            }
          });
          let index = this.IdentificationsByVOB.findIndex(x => x.Type === "MSME Certificate");
          if (index >= 0) {
            this.MSMERow = this.IdentificationsByVOB[index];
            console.log('MSMERow', this.MSMERow);
            this.IdentificationsByVOB.splice(index, 1);
            this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
          }
        }
        this.AllIdentityTypes.forEach(types => {
          let temp = -1;
          this.IdentificationsByVOB.forEach(identity => {
            if (identity.Type === types) {
              temp = 0;
            }
          });
          if (temp < 0) {
            const Identity = new BPIdentity();
            Identity.Type = types;
            this.IdentificationsByVOB.push(Identity);
          }
        });
        this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);

        if (this.PanEnable) {

          this.AllIdentityTypes.forEach((types, index) => {
            if (types === "GST") {
              this.AllIdentityTypes.splice(index, 1);
            }
          });
          const index = this.IdentificationsByVOB.findIndex(x => x.Type === "GST");
          this.IdentificationsByVOB.splice(index, 1);
          this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);

        }
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
          console.log('data', data[0].Status);
          if (data[0].Status === 'Success') {
            this.StateCode = loc.StateCode;
            this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
            this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
            this.identificationFormGroup.get('StateCode').patchValue(loc.StateCode);
          }
          else {
            console.log('Pincode not found');
            this.vendorRegistrationFormGroup.get('PinCode').markAsDirty();
            this.vendorRegistrationFormGroup.get('PinCode').setValue('');
            // window.alert('Error');

          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  GetLocationByPincode(event): void {
    // const Pincode = event.target.value;
    // console.log('Pincode', Pincode);
    // if (Pincode) {
    //   this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
    //     (data) => {
    //       const loc = data as CBPLocation;
    //       // this.StateCode = loc.StateCode;
    //       if (data !=null) {
    //         this.StateCode = loc.StateCode;
    //         this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
    //         this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
    //         this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
    //         this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
    //         this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
    //         this.identificationFormGroup.get('StateCode').patchValue(loc.StateCode);
    //       }
    //       else {
    //         console.log('Pincode not found');
    //         this.vendorRegistrationFormGroup.get('PinCode').markAsDirty();
    //         this.vendorRegistrationFormGroup.get('PinCode').setValue('');
    //         // window.alert('Error');

    //       }
    //       // this.addressline1 = [];
    //       // if (data[0].Status === 'Success') {
    //       //   this.Postaldata = true;
    //       //   for (let i = 0; i < data[0].PostOffice.length; i++) {
    //       //     this.addressline1.push(data[0].PostOffice[i].Name);
    //       //   }
    //       //   // this.StateCode = loc.StateCode;
    //       //   this.vendorRegistrationFormGroup.get('City').patchValue(data[0].PostOffice[0].Division);
    //       //   this.vendorRegistrationFormGroup.get('State').patchValue(data[0].PostOffice[0].State);
    //       //   this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].PostOffice[0].Country);
    //       //   this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(data[0].PostOffice[0].Division + ',' + data[0].PostOffice[0].Region);
    //       //   // this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
    //       // }
    //       // else {
    //       //   // this.vendorRegistrationFormGroup.get('PinCode').markAsDirty();
    //       //   // this.vendorRegistrationFormGroup.get('PinCode').setValue('');
    //       //   // window.alert('Error');
    //       //   this.vendorRegistrationFormGroup.get('City').setValue('');
    //       //   this.vendorRegistrationFormGroup.get('State').setValue('');
    //       //   this.vendorRegistrationFormGroup.get('Country').setValue('');
    //       //   this.vendorRegistrationFormGroup.get('AddressLine2').setValue('');
    //       //   this.vendorRegistrationFormGroup.get('PinCode').setErrors({
    //       //     data: { message: 'Pincode is not valid :)' },
    //       //   });
    //       //   this.Postaldata = false;
    //       //   console.log(this.Postaldata);
    //       // }
    //       // // const loc = data as CBPLocation;
    //       // // if (loc) {
    //       // //   this.StateCode = loc.StateCode;
    //       // //   this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
    //       // //   this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
    //       // //   this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
    //       // //   this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
    //       // // }
    //     },
    //     (err) => {
    //       console.error(err);
    //     }
    //   );
    // }

  }
  // ValidateIdentityByType(IdentityType: any, ID: any): void {
  //   if (IdentityType) {
  //     this._vendorMasterService.ValidateIdentityByType(IdentityType, ID).subscribe(
  //       (data) => {
  //         this.CBPIdentity = data as CBPIdentity;
  //         if (this.CBPIdentity) {
  //           // this.AddDynamicValidatorsIdentificationFormGroup();
  //           this.IdentityValidity = false;
  //           // if (status === 'Matched') {
  //           //   this.IdentityValidity = false;
  //           // }
  //           // else {
  //           //   this.IdentityValidity = true;
  //           // }
  //         } else {
  //           this.IdentityValidity = true;
  //         }
  //       },
  //       (err) => {
  //         console.error(err);
  //       }
  //     );
  //   }
  // }

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
    console.log('OnPincodeKeyEnter Pincode', Pincode);
    if (Pincode) {
      this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const postal = data as CBPLocation;
          this.addressline1 = [];
          // if (data[0].Status === 'Success') {
          //   this.Postaldata = false;
          //   for (let i = 0; i < data[0].PostOffice.length; i++) {
          //     this.addressline1.push(data[0].PostOffice[i].Name);
          //   }
          //   this.vendorRegistrationFormGroup.get('City').patchValue(data[0].PostOffice[0].Division);
          //   this.vendorRegistrationFormGroup.get('State').patchValue(data[0].PostOffice[0].State);
          //   this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].PostOffice[0].Country);
          //   this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(data[0].PostOffice[0].Division + ',' + data[0].PostOffice[0].Region);
          //   // this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].Country);
          //   // tslint:disable-next-line:no-unused-expression
          //   this.vendorRegistrationFormGroup.get('City').disable;
          //   // tslint:disable-next-line: no-unused-expression
          //   this.vendorRegistrationFormGroup.get('State').disable;
          //   // this.vendorRegistrationFormGroupAddressLine2
          // }
          if (postal) {
            this.vendorRegistrationFormGroup.get('City').patchValue(postal.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(postal.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(postal.Country);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(postal.Taluk + ',' + postal.State);
          }
          else {
            // this.vendorRegistrationFormGroup.get('PinCode').markAsDirty();
            // this.vendorRegistrationFormGroup.get('PinCode').setValue('');
            // window.alert('Error');
            this.vendorRegistrationFormGroup.get('City').setValue('');
            this.vendorRegistrationFormGroup.get('State').setValue('');
            this.vendorRegistrationFormGroup.get('Country').setValue('');
            this.vendorRegistrationFormGroup.get('AddressLine2').setValue('');
            this.vendorRegistrationFormGroup.get('PinCode').setErrors({
              data: { message: 'Pincode is not valid :)' },
            });
            this.Postaldata = false;
            console.log(this.Postaldata);
          }
          // const loc = data as CBPLocation;
          // if (loc) {
          //   this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
          //   this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
          //   this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
          //   this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
          // }
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
    this.vendorRegistrationFormGroup.get('Field1').patchValue(this.SelectedBPVendorOnBoarding.Field1);
    this.vendorRegistrationFormGroup.get('Field2').patchValue(this.SelectedBPVendorOnBoarding.Field2);
    this.vendorRegistrationFormGroup.get('Field3').patchValue(this.SelectedBPVendorOnBoarding.Field3);
    this.vendorRegistrationFormGroup.get('Field4').patchValue(this.SelectedBPVendorOnBoarding.Field4);
    this.vendorRegistrationFormGroup.get('Field5').patchValue(this.SelectedBPVendorOnBoarding.Field5);
    this.vendorRegistrationFormGroup.get('Field6').patchValue(this.SelectedBPVendorOnBoarding.Field6);
    this.vendorRegistrationFormGroup.get('Field7').patchValue(this.SelectedBPVendorOnBoarding.Field7);
    this.vendorRegistrationFormGroup.get('Field8').patchValue(this.SelectedBPVendorOnBoarding.Field8);
    this.vendorRegistrationFormGroup.get('Field9').patchValue(this.SelectedBPVendorOnBoarding.Field9);
    this.vendorRegistrationFormGroup.get('Field10').patchValue(this.SelectedBPVendorOnBoarding.Field10);
  }

  GetBPVendorOnBoardingSubItems(): void {
    this.GetIdentificationsByVOB();
    this.GetBanksByVOB();
    this.GetContactsByVOB();
    this.GetActivityLogsByVOB();
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

  GetActivityLogsByVOB(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetActivityLogsByVOB(this.SelectedBPVendorOnBoarding.TransID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.ActivityLogsByVOB = data as BPActivityLog[];
        this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  IdentityTypeSelected(): void {
    const selectedType = this.identificationFormGroup.get('Type').value as string;
    if (this.identificationFormGroup.get('Type').value === "GST" || this.identificationFormGroup.get('Type').value === "PAN") {
      this.identificationFormGroup.get('IDNumber').disable();
    }
    // if (selectedType) {
    //   this.AddDynamicValidatorsIdentificationFormGroup(selectedType);
    //   if (selectedType.toLowerCase().includes('gst')) {
    //     this.identificationFormGroup.get('IDNumber').patchValue(this.StateCode);
    //   }
    // }
  }

  AddIdentificationToTable(): void {
    if (this.identificationFormGroup.valid) {
      if (this.fileToUpload) {
        const bPIdentity = new BPIdentity();
        bPIdentity.Type = this.identificationFormGroup.get('Type').value;
        bPIdentity.IDNumber = this.identificationFormGroup.get('IDNumber').value;
        bPIdentity.Option = this.identificationFormGroup.get('Option').value;
        if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length || !this.IdentificationsByVOB[0].Type) {
          this.IdentificationsByVOB = [];
        }
        const dup = this.IdentificationsByVOB.filter(x => x.Type === bPIdentity.Type && x.IDNumber === bPIdentity.IDNumber)[0];
        if (!dup) {
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
              if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length || !this.IdentificationsByVOB[0].Type) {
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
            if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length || !this.IdentificationsByVOB[0].Type) {
              this.IdentificationsByVOB = [];
            }
            this.IdentificationsByVOB.push(bPIdentity);
            this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
            this.ClearIdentificationFormGroup();
          }
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(`Please select an attachment`, SnackBarStatus.danger, 5000);
      }
    } else {
      this.ShowValidationErrors(this.identificationFormGroup);
    }
  }

  AddBankToTable(): void {
    if (this.bankDetailsFormGroup.valid) {
      if (this.fileToUpload1) {
        const bPBank = new BPBank();
        bPBank.AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
        bPBank.Name = this.bankDetailsFormGroup.get('Name').value;
        bPBank.IFSC = this.bankDetailsFormGroup.get('IFSC').value;
        bPBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
        bPBank.Branch = this.bankDetailsFormGroup.get('Branch').value;
        bPBank.City = this.bankDetailsFormGroup.get('City').value;
        if (this.fileToUpload1) {
          bPBank.AttachmentName = this.fileToUpload1.name;
          this.fileToUploadList.push(this.fileToUpload1);
          this.fileToUpload1 = null;
        }
        if (!this.BanksByVOB || !this.BanksByVOB.length || !this.BanksByVOB[0].AccountNo) {
          this.BanksByVOB = [];
        }
        const dupli = this.BanksByVOB.filter(x => x.AccountNo === bPBank.AccountNo)[0];
        if (!dupli) {
          this.BanksByVOB.push(bPBank);
          this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
          this.ClearBankDetailsFormGroup();
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(`Please select an attachment`, SnackBarStatus.danger, 5000);
      }
    } else {
      this.ShowValidationErrors(this.bankDetailsFormGroup);
    }
  }
  AddContactToTableDataSource(): void {
    if (this.InitialContact) {
      this.ContactsByVOB = [];
      this.contactDataSource = new MatTableDataSource<BPContact>(this.ContactsByVOB);
      this.InitialContact = false;
      console.log('this.InitialBank = false', this.InitialBank);
    }
    if (this.contactFormGroup.valid) {
      const bPContact = new BPContact();
      bPContact.Name = this.contactFormGroup.get('Name').value;
      bPContact.Department = this.contactFormGroup.get('Department').value;
      bPContact.Title = this.contactFormGroup.get('Title').value;
      bPContact.Mobile = this.contactFormGroup.get('Mobile').value;
      bPContact.Email = this.contactFormGroup.get('Email').value;
      if (this.contactDetailsIndex !== null && this.contactDetailsIndex >= 0) {
        if (this.ContactsByVOB.length === 0) {
          this.ContactsByVOB = [];
          const duplicate = this.ContactsByVOB.filter(x => x.Mobile === bPContact.Mobile)[0];
          if (!duplicate) {
            this.ContactsByVOB.push(bPContact);
            this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
            this.contactDetailsIndex = null;
            this.ClearContactFormGroup();
            this.contactFormGroup.get('Department').patchValue(this.DeptValue);
          }
          else {
            this.notificationSnackBarComponent.openSnackBar(`Duplicate record , Mobile number Should be unique`, SnackBarStatus.danger, 8000);
          }
        }
        this.contactDataSource.data[this.contactDetailsIndex].Name = this.contactFormGroup.get('Name').value;
        this.contactDataSource.data[this.contactDetailsIndex].Department = this.contactFormGroup.get('Department').value;
        this.contactDataSource.data[this.contactDetailsIndex].Title = this.contactFormGroup.get('Title').value;
        this.contactDataSource.data[this.contactDetailsIndex].Mobile = this.contactFormGroup.get('Mobile').value;
        this.contactDataSource.data[this.contactDetailsIndex].Email = this.contactFormGroup.get('Email').value;
        this.contactDetailsIndex = null;
        this.ClearContactFormGroup();
        this.contactFormGroup.get('Department').patchValue(this.DeptValue);
        // this.contactFormGroup.get('Department').patchValue(this.BPVendorOnBoarding.Department);
      }
      else {
        if (!this.ContactsByVOB || !this.ContactsByVOB.length || !this.ContactsByVOB[0].Name) {
          this.ContactsByVOB = [];
        }
        const duplicate = this.ContactsByVOB.filter(x => x.Mobile === bPContact.Mobile)[0];
        if (!duplicate) {
          this.ContactsByVOB.push(bPContact);
          this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
          this.contactDetailsIndex = null;
          this.ClearContactFormGroup();
          this.contactFormGroup.get('Department').patchValue(this.DeptValue);
          // this.contactFormGroup.get('Department').patchValue(this.BPVendorOnBoarding.Department);
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record , Mobile number Should be unique`, SnackBarStatus.danger, 8000);
        }
      }
    }
    else {
      this.ShowValidationErrors(this.contactFormGroup);
    }
  }
  SelectIdentityRow(row: any, index: any): void {
    if (this.ProcessRequest) {
      this.openSnackBar("Please Wait Request In Progress", SnackBarStatus.danger);
    }
    else {
      this.IdentityRowSelectedIndex = index;
      this.identificationFormGroup.get('IDNumber').enable();
      console.log("SelectIdentityRow", row)
      this.identificationFormGroup.get('Type').patchValue(row.Type);
      this.identificationFormGroup.get('IDNumber').patchValue(row.IDNumber);
      if (this.identificationFormGroup.get('Type').value === "GST") {
        this.identificationFormGroup.get('IDNumber').disable();
      }
      if (this.identificationFormGroup.get('Type').value === "PAN") {
        this.identificationFormGroup.get('IDNumber').disable();
      }
      this.ShowAddIdentityButton = true;
      this.SelectedIdentity = row;
    }
  }
  AddIdentificationToTableDataSource(): void {
    // if (this.identificationFormGroup.valid) {
    //   if (this.fileToUpload) {
    //     const Identity = new BPIdentity();
    //     if (this.IdentityRowSelectedIndex !== null) {
    //       const filesize = Math.round((this.fileToUpload.size / 1000));

    //       const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationDataSource.data[this.IdentityRowSelectedIndex].Type);
    //       if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
    //         this.IsProgressBarVisibile = true;
    //         this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName).subscribe(
    //           (data) => {
    //             console.log(data);
    //             if (data !== null) {
    //               this.identificationDataSource.data[this.IdentityRowSelectedIndex].Type = this.identificationFormGroup.get('Type').value;
    //               this.identificationDataSource.data[this.IdentityRowSelectedIndex].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //               this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName = this.fileToUpload.name;
    //               //  this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName = this.fileToUpload.name;
    //               console.log('AttachmentName', this.identificationFormGroup.get('Type').value + "_" + this.fileToUpload.name);
    //               if (this.fileToUpload) {
    //                 const index = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
    //                 if (index >= 0) {
    //                   this.fileToUploadList.splice(index, 1);
    //                 }
    //                 this.fileToUploadList.push(this.fileToUpload);

    //               }
    //               this.ClearIdentificationFormGroup();
    //               this.IdentityRowSelectedIndex = null;
    //               this.fileToUpload = null;
    //               // this.ShowAddIdentityButton=false
    //               this.identificationFormGroup.get('IDNumber').enable();
    //               this.IsProgressBarVisibile = false;

    //             }
    //             else {
    //               this.IsProgressBarVisibile = false;

    //               this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
    //             }
    //           },
    //           (err) => {
    //             this.IsProgressBarVisibile = false;

    //             console.log("Error", err);
    //           }
    //         );
    //       }
    //       else {
    //         let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB;
    //         this.openSnackBar(error, SnackBarStatus.danger)
    //       }
    //     }
    //     else {

    //       let index = this.identificationDataSource.data.findIndex(x => x.Type == this.identificationFormGroup.get('Type').value);
    //       const filesize = Math.round((this.fileToUpload.size / 1000));

    //       const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationFormGroup.get('Type').value);
    //       if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
    //         this.IsProgressBarVisibile = true;

    //         this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[index].AttachmentName).subscribe(
    //           (data) => {
    //             if (data !== null) {
    //               this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
    //               this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //               this.identificationDataSource.data[index].AttachmentName = this.fileToUpload.name;
    //               if (this.fileToUploadList) {
    //                 const index = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
    //                 if (index >= 0) {
    //                   this.fileToUploadList.splice(index, 1);
    //                 }
    //                 this.fileToUploadList.push(this.fileToUpload);
    //                 this.fileToUpload = null;
    //               }
    //               this.ClearIdentificationFormGroup();
    //               this.fileToUpload = null;
    //               // this.ShowAddIdentityButton=false
    //               this.identificationFormGroup.get('IDNumber').enable();
    //               this.IsProgressBarVisibile = false;

    //             }
    //             else {
    //               this.IsProgressBarVisibile = false;

    //               this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
    //             }
    //           });
    //       }
    //       else {
    //         this.IsProgressBarVisibile = false;

    //         let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";
    //         this.openSnackBar(error, SnackBarStatus.danger)
    //       }
    //     }
    //   }
    //   else {
    //     if (this.vendorRegistrationFormGroup.get('MSMEType').value === "Not Applicable" && this.identificationFormGroup.get('Type').value === "MSME") {
    //       let index = this.identificationDataSource.data.findIndex(x => x.Type == this.identificationFormGroup.get('Type').value);
    //       const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationFormGroup.get('Type').value);
    //       if (this.fileToUpload) {
    //         const filesize = Math.round((this.fileToUpload.size / 1000));
    //         if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
    //           this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[index].AttachmentName).subscribe(
    //             (data) => {
    //               if (data !== null) {
    //                 this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
    //                 this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //                 this.identificationDataSource.data[index].AttachmentName = this.fileToUpload.name;
    //                 this.ClearIdentificationFormGroup();
    //                 this.fileToUpload = null;
    //                 // this.ShowAddIdentityButton=false
    //                 this.identificationFormGroup.get('IDNumber').enable();
    //               }
    //               else {
    //                 this.IsProgressBarVisibile = false;
    //                 this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
    //               }
    //             });
    //         }
    //         else {
    //           let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";

    //           this.openSnackBar(error, SnackBarStatus.danger);
    //         }
    //       }
    //       else {
    //         this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
    //         this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //         this.ClearIdentificationFormGroup();
    //         this.fileToUpload = null;
    //         // this.ShowAddIdentityButton=false
    //         this.identificationFormGroup.get('IDNumber').enable();
    //       }
    //     }
    //     else {
    //       this.openSnackBar('Please Add Attachment', SnackBarStatus.danger);
    //     }
    //   }
    // }
    // else {
    //   if (!this.MSMEMandatory && this.vendorRegistrationFormGroup.get('MSMEType').value === "Not Applicable" && this.identificationFormGroup.get('Type').value === "MSME") {
    //     let index = this.identificationDataSource.data.findIndex(x => x.Type == this.identificationFormGroup.get('Type').value);
    //     const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationFormGroup.get('Type').value);
    //     if (this.fileToUpload) {
    //       const filesize = Math.round((this.fileToUpload.size / 1000));
    //       if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
    //         this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
    //         this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //         this.identificationDataSource.data[index].AttachmentName = this.fileToUpload.name;
    //         this.ClearIdentificationFormGroup();
    //         this.fileToUpload = null;
    //         // this.ShowAddIdentityButton=false
    //         this.identificationFormGroup.get('IDNumber').enable();
    //       }
    //       else {
    //         let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";

    //         this.openSnackBar(error, SnackBarStatus.danger);
    //       }
    //     }
    //     else {
    //       this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
    //       this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
    //       this.ClearIdentificationFormGroup();
    //       this.fileToUpload = null;
    //       // this.ShowAddIdentityButton=false
    //       this.identificationFormGroup.get('IDNumber').enable();
    //     }
    //   }
    //   else {
    //     this.ShowValidationErrors(this.identificationFormGroup);
    //   }
    // }


    //New Code
    if (this.identificationFormGroup.valid) {
      // if (this.initialIdentity) {
      //   this.IdentificationsByVOB = [];
      //   this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
      //   this.initialIdentity = false;
      //   console.log('this.InitialBank = false', this.InitialBank);
      // }
      if (this.fileToUpload) {
        if (this.IdentityRowSelectedIndex !== null) {
          const filesize = Math.round((this.fileToUpload.size / 1000));

          const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationDataSource.data[this.IdentityRowSelectedIndex].Type);
          if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
            this.IsProgressBarVisibile = true;
            this.ProcessRequest = true;
            this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName).subscribe(
              (data) => {
                console.log(data);
                if (data !== null) {
                  this.identificationDataSource.data[this.IdentityRowSelectedIndex].Type = this.identificationFormGroup.get('Type').value;
                  // this.identificationDataSource.data[this.IdentityRowSelectedIndex].IDNumber = this.identificationFormGroup.get('IDNumber').value;
                  this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName = this.fileToUpload.name;
                  //  this.identificationDataSource.data[this.IdentityRowSelectedIndex].AttachmentName = this.fileToUpload.name;
                  console.log('AttachmentName', this.identificationFormGroup.get('Type').value + "_" + this.fileToUpload.name);
                  if (this.fileToUpload) {
                    const index = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
                    if (index >= 0) {
                      this.fileToUploadList.splice(index, 1);
                    }
                    this.fileToUploadList.push(this.fileToUpload);

                  }
                  this.ClearIdentificationFormGroup();
                  this.IdentityRowSelectedIndex = null;
                  this.fileToUpload = null;
                  // this.ShowAddIdentityButton=false
                  this.identificationFormGroup.get('IDNumber').enable();
                  this.IsProgressBarVisibile = false;
                  this.ProcessRequest = false;

                }
                else {
                  this.IsProgressBarVisibile = false;
                  this.ProcessRequest = false;
                  this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
                }
              },
              (err) => {
                this.IsProgressBarVisibile = false;
                this.ProcessRequest = false;
                console.log("Error", err);
              }
            );
          }
          else {
            let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";
            this.openSnackBar(error, SnackBarStatus.danger)
          }
        }
        else {

          let index = this.identificationDataSource.data.findIndex(x => x.Type == this.identificationFormGroup.get('Type').value);
          const filesize = Math.round((this.fileToUpload.size / 1000));

          const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationFormGroup.get('Type').value);
          if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
            this.IsProgressBarVisibile = true;

            this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[index].AttachmentName).subscribe(
              (data) => {
                if (data !== null) {
                  this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
                  // this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
                  this.identificationDataSource.data[index].AttachmentName = this.fileToUpload.name;
                  if (this.fileToUploadList) {
                    const index = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
                    if (index >= 0) {
                      this.fileToUploadList.splice(index, 1);
                    }
                    this.fileToUploadList.push(this.fileToUpload);
                    this.fileToUpload = null;
                  }
                  this.ClearIdentificationFormGroup();
                  this.fileToUpload = null;
                  // this.ShowAddIdentityButton=false
                  this.identificationFormGroup.get('IDNumber').enable();
                  this.IsProgressBarVisibile = false;

                }
                else {
                  this.IsProgressBarVisibile = false;

                  this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
                }
              });
          }
          else {
            this.IsProgressBarVisibile = false;

            let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";
            this.openSnackBar(error, SnackBarStatus.danger)
          }
        }
      }
      else {
        if (this.identificationFormGroup.get('Type').value !== "Others") {
          this.openSnackBar('Please Add Attachment', SnackBarStatus.danger);
        }
        else {
          let index = this.identificationDataSource.data.findIndex(x => x.Type == this.identificationFormGroup.get('Type').value);
          const filesize = Math.round((this.fileToUpload.size / 1000));

          const IdentityFieldIndex = this.CBPIdentity.findIndex(x => x.Text === this.identificationFormGroup.get('Type').value);
          if (filesize <= this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB) {
            this._vendorRegistrationService.AddUserAttachment(this.VendorTokenCheck.transID, this.VendorTokenCheck.emailAddress, this.fileToUpload, this.identificationDataSource.data[index].AttachmentName).subscribe(
              (data) => {
                if (data !== null) {
                  this.identificationDataSource.data[index].Type = this.identificationFormGroup.get('Type').value;
                  // this.identificationDataSource.data[index].IDNumber = this.identificationFormGroup.get('IDNumber').value;
                  this.identificationDataSource.data[index].AttachmentName = this.fileToUpload.name;
                  if (this.fileToUploadList) {
                    const index = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
                    if (index >= 0) {
                      this.fileToUploadList.splice(index, 1);
                    }
                    this.fileToUploadList.push(this.fileToUpload);
                    this.fileToUpload = null;
                  }
                  this.ClearIdentificationFormGroup();
                  this.fileToUpload = null;
                  // this.ShowAddIdentityButton=false
                  this.identificationFormGroup.get('IDNumber').enable();
                  this.IsProgressBarVisibile = false;

                }
                else {
                  this.IsProgressBarVisibile = false;

                  this.openSnackBar('Duplicate attachment found', SnackBarStatus.danger);
                }
              });
          }
          else {
            this.IsProgressBarVisibile = false;

            let error = "File Size Should be less than " + this.CBPIdentity[IdentityFieldIndex].MaxSizeInKB + "KB";
            this.openSnackBar(error, SnackBarStatus.danger)
          }
        }
      }
    }
    else {
      this.ShowValidationErrors(this.identificationFormGroup);
    }
  }
  openSnackBar(Message: string, status: SnackBarStatus, duration = 2000): void {
    this.snackBar.open(Message, '', {
      duration: duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: status === SnackBarStatus.success ? 'success' : status === SnackBarStatus.danger ? 'danger' :
        status === SnackBarStatus.warning ? 'warning' : 'info'
    });
  }
  ContactPersonsClicked(Contactdetails: any, index: any): void {
    this.ClearContactFormGroup();
    this.contactDetailsIndex = index;
    console.log('Row:', this.contactFormGroup, 'Index:', index);
    this.contactFormGroup.get('Name').patchValue(Contactdetails.Name);
    this.contactFormGroup.get('Department').patchValue(Contactdetails.Department);
    this.contactFormGroup.get('Title').patchValue(Contactdetails.Title);
    this.contactFormGroup.get('Mobile').patchValue(Contactdetails.Mobile);
    this.contactFormGroup.get('Email').patchValue(Contactdetails.Email);
  }
  AddBankToTableDataSource(): void {
    console.log('Bank Data', this.bankDetailsDataSource);
    if (this.bankDetailsFormGroup.valid) {
      // if (this.fileToUpload1 || this.bankChangeIndex >= 0) {
      //   const bPBank = new BPBank();
      //   bPBank.AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
      //   bPBank.Name = this.bankDetailsFormGroup.get('Name').value;
      //   bPBank.IFSC = this.bankDetailsFormGroup.get('IFSC').value;
      //   bPBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
      //   bPBank.Branch = this.bankDetailsFormGroup.get('Branch').value;
      //   bPBank.City = this.bankDetailsFormGroup.get('City').value;
      //   if (this.fileToUpload1) {
      //     bPBank.AttachmentName = this.fileToUpload1.name;
      //     this.fileToUploadList.push(this.fileToUpload1);
      //     this.fileToUpload1 = null;
      //   }
      //   if (!this.BanksByVOB || !this.BanksByVOB.length || !this.BanksByVOB[0].AccountNo) {
      //     this.BanksByVOB = [];
      //   }
      //   const dupli = this.BanksByVOB.filter(x => x.AccountNo === bPBank.AccountNo)[0];
      //   if (!dupli) {
      //     this.BanksByVOB.push(bPBank);
      //     this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
      //     this.bankChangeIndex = null;
      //     this.ClearBankDetailsFormGroup();
      //   }
      //   else {
      //     if (this.bankChangeIndex !== null && this.bankChangeIndex >= 0) {
      //       console.log('Change data source', this.bankDetailsDataSource.data);
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].Name = this.bankDetailsFormGroup.get('Name').value;
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].IFSC = this.bankDetailsFormGroup.get('IFSC').value;
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].BankName = this.bankDetailsFormGroup.get('BankName').value;
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].Branch = this.bankDetailsFormGroup.get('Branch').value;
      //       this.bankDetailsDataSource.data[this.bankChangeIndex].City = this.bankDetailsFormGroup.get('City').value;
      //       this.bankChangeIndex = null;

      //     }
      //     else {
      //       this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);

      //     }
      //     // this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
      //   }
      //   this.ClearBankDetailsFormGroup();
      // }
      if (this.InitialBank) {
        this.BanksByVOB = [];
        this.bankDetailsDataSource = new MatTableDataSource<BPBank>(this.BanksByVOB);
        this.InitialBank = false;
        console.log('this.InitialBank = false', this.InitialBank);
      }
      if (this.bankChangeIndex >= 0 && this.bankChangeIndex !== null) {
        if (this.BanksByVOB.length === 0) {
          const bPBank = new BPBank();
          bPBank.AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
          bPBank.Name = this.bankDetailsFormGroup.get('Name').value;
          bPBank.IFSC = this.bankDetailsFormGroup.get('IFSC').value;
          bPBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
          bPBank.Branch = this.bankDetailsFormGroup.get('Branch').value;
          bPBank.City = this.bankDetailsFormGroup.get('City').value;
          const dupli = this.BanksByVOB.findIndex(x => x.AccountNo === bPBank.AccountNo);
          console.log('dupli', dupli, this.BanksByVOB);
          if (dupli === -1) {
            this.BanksByVOB.push(bPBank);
          }
          else {
            this.notificationSnackBarComponent.openSnackBar(`Duplicate record, Account Number Should be Unique`, SnackBarStatus.danger, 5000);
          }
        }
        else {
          this.BanksByVOB[this.bankChangeIndex].AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
          this.BanksByVOB[this.bankChangeIndex].Name = this.bankDetailsFormGroup.get('Name').value;
          this.BanksByVOB[this.bankChangeIndex].IFSC = this.bankDetailsFormGroup.get('IFSC').value;
          this.BanksByVOB[this.bankChangeIndex].BankName = this.bankDetailsFormGroup.get('BankName').value;
          this.BanksByVOB[this.bankChangeIndex].Branch = this.bankDetailsFormGroup.get('Branch').value;
          this.BanksByVOB[this.bankChangeIndex].City = this.bankDetailsFormGroup.get('City').value;
        }
        this.bankDetailsDataSource = new MatTableDataSource<BPBank>(this.BanksByVOB);

        this.bankChangeIndex = null;
        this.ClearBankDetailsFormGroup();
      }
      else {
        // if (this.fileToUpload1) {
        const bPBank = new BPBank();
        bPBank.AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
        bPBank.Name = this.bankDetailsFormGroup.get('Name').value;
        bPBank.IFSC = this.bankDetailsFormGroup.get('IFSC').value;
        bPBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
        bPBank.Branch = this.bankDetailsFormGroup.get('Branch').value;
        bPBank.City = this.bankDetailsFormGroup.get('City').value;
        // bPBank.AttachmentName = this.fileToUpload1.name;
        const dupli = this.BanksByVOB.findIndex(x => x.AccountNo === bPBank.AccountNo);
        console.log('dupli', dupli, this.BanksByVOB);
        if (dupli === -1) {
          this.BanksByVOB.push(bPBank);
          console.log(this.BanksByVOB);
          // this.fileToUploadList.push(this.fileToUpload1);
          // console.log('Bank else', this.fileToUploadList);
          this.bankDetailsDataSource = new MatTableDataSource<BPBank>(this.BanksByVOB);
          this.bankChangeIndex = null;
          // this.fileToUpload1 = null;
          this.ClearBankDetailsFormGroup();
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record, Account Number Should be Unique`, SnackBarStatus.danger, 5000);
        }
        this.ClearBankDetailsFormGroup();
      }

    }
    else {
      this.ShowValidationErrors(this.bankDetailsFormGroup);
    }
  }
  BankRowClicked(BankDetails: any, index: any): void {
    this.ClearBankDetailsFormGroup();
    this.fileToUpload1 = this.fileToUploadList[index];
    this.bankChangeIndex = index;
    console.log('Row:', this.bankDetailsFormGroup, 'Index:', this.bankChangeIndex);
    this.bankDetailsFormGroup.get('AccountNo').patchValue(BankDetails.AccountNo);
    this.bankDetailsFormGroup.get('Name').patchValue(BankDetails.Name);
    this.bankDetailsFormGroup.get('IFSC').patchValue(BankDetails.IFSC);
    this.bankDetailsFormGroup.get('BankName').patchValue(BankDetails.BankName);
    this.bankDetailsFormGroup.get('Branch').patchValue(BankDetails.Branch);
    this.bankDetailsFormGroup.get('City').patchValue(BankDetails.City);

  }
  AddContactToTable(): void {
    if (this.contactFormGroup.valid) {
      const bPContact = new BPContact();
      bPContact.Name = this.contactFormGroup.get('Name').value;
      bPContact.Department = this.contactFormGroup.get('Department').value;
      bPContact.Title = this.contactFormGroup.get('Title').value;
      bPContact.Mobile = this.contactFormGroup.get('Mobile').value;
      bPContact.Email = this.contactFormGroup.get('Email').value;
      if (!this.ContactsByVOB || !this.ContactsByVOB.length || !this.ContactsByVOB[0].Name) {
        this.ContactsByVOB = [];
      }
      const duplicate = this.ContactsByVOB.filter(x => x.Mobile === bPContact.Mobile)[0];
      if (!duplicate) {
        this.ContactsByVOB.push(bPContact);
        this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
        this.ClearContactFormGroup();
      }
      else {
        this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
      }
    } else {
      this.ShowValidationErrors(this.contactFormGroup);
    }
  }

  AddActivityLogToTable(): void {
    if (this.activityLogFormGroup.valid) {
      const bPActivityLog = new BPActivityLog();
      bPActivityLog.Activity = this.activityLogFormGroup.get('Activity').value;
      bPActivityLog.Date = this.activityLogFormGroup.get('Date').value;
      bPActivityLog.Time = this.activityLogFormGroup.get('Time').value;
      bPActivityLog.Text = this.activityLogFormGroup.get('Text').value;
      if (!this.ActivityLogsByVOB || !this.ActivityLogsByVOB.length || !this.ActivityLogsByVOB[0].Activity) {
        this.ActivityLogsByVOB = [];
      } const duplicate = this.ActivityLogsByVOB.filter(x => x.Text === bPActivityLog.Text)[0];
      if (!duplicate) {

        this.ActivityLogsByVOB.push(bPActivityLog);
        this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
        this.ClearActivityLogFormGroup();
      }
      else {
        this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
      }
    } else {
      this.ShowValidationErrors(this.activityLogFormGroup);
    }
  }

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

  ActivityLogEnterKeyDown(): boolean {
    this.activityText.nativeElement.blur();
    this.AddActivityLogToTable();
    return true;
  }

  RemoveIdentificationFromTable(bPIdentity: BPIdentity): void {
    this.index = this.IdentificationsByVOB.indexOf(bPIdentity);
    const Actiontype = 'delete';
    const Catagory = 'Row';
    this.OpenConfirmationDialog(Actiontype, Catagory);

    this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
  }
  removeidentity(): void {
    if (this.index > -1) {
      this.IdentificationsByVOB.splice(this.index, 1);
      this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
      if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length) {
        this.InitializeIdentificationTable();
      }
    }
  }

  RemoveBankFromTable(bPBank: BPBank): void {
    this.index = this.BanksByVOB.indexOf(bPBank);
    const Actiontype = 'deleting';
    const Catagory = 'Row';
    this.OpenConfirmationDialog(Actiontype, Catagory);
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
  }
  removebank(): void {
    if (this.index > -1) {
      this.BanksByVOB.splice(this.index, 1);
      this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
      if (!this.BanksByVOB || !this.BanksByVOB.length) {
        this.InitializeBankDetailsTable();
      }
      this.index = null;
    }
  }

  RemoveContactFromTable(bPContact: BPContact): void {
    this.index = this.ContactsByVOB.indexOf(bPContact);
    const Actiontype = 'be delete';
    const Catagory = 'Row';
    this.OpenConfirmationDialog(Actiontype, Catagory);
    this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
  }
  removecontact(): void {
    if (this.index > -1) {
      this.ContactsByVOB.splice(this.index, 1);
      this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
      if (!this.ContactsByVOB || !this.ContactsByVOB.length) {
        this.InitializeContactTable();
      }
      this.index = null;
    }
  }


  RemoveActivityLogFromTable(bPActivityLog: BPActivityLog): void {
    this.index = this.ActivityLogsByVOB.indexOf(bPActivityLog);
    const Actiontype = 'can be delete';
    const Catagory = 'Row';
    this.OpenConfirmationDialog(Actiontype, Catagory);
    this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  }
  remove(): void {
    if (this.index > -1) {
      this.ActivityLogsByVOB.splice(this.index, 1);
      this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
      if (!this.ActivityLogsByVOB || !this.ActivityLogsByVOB.length) {
        this.InitializeActivityTable();
      }
      this.index = null;
    }
  }

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
          } else if (Actiontype === 'delete') {
            // this.IdentificationsByVOB.splice(0, 1);
            // this.InitializeIdentificationTable();
            this.removeidentity();
          } else if (Actiontype === 'deleting') {
            // this.BanksByVOB.splice(0, 1);
            // this.InitializeBankDetailsTable();
            this.removebank();
          } else if (Actiontype === 'be delete') {
            // this.AddContactToTable();
            // this.ContactsByVOB.splice(0, 1);
            // this.InitializeContactTable();
            this.removecontact();
          } else if (Actiontype === 'can be delete') {
            this.remove();
          }
        }
      });
  }
  GetBPVendorValues(): void {
    this.SelectedBPVendorOnBoarding.Email1 = this.SelectedBPVendorOnBoardingView.Email1 = this.vendorRegistrationFormGroup.get('Email1').value;
    this.SelectedBPVendorOnBoarding.Phone1 = this.SelectedBPVendorOnBoardingView.Phone1 = this.vendorRegistrationFormGroup.get('Phone1').value;
  }
  GetBPVendorOnBoardingValues(): void {
    console.log('VendorType', this.VendorType);
    this.vendorRegistrationFormGroup.get('Type').patchValue(this.VendorType);
    this.SelectedBPVendorOnBoarding.Name = this.SelectedBPVendorOnBoardingView.Name = this.vendorRegistrationFormGroup.get('Name').value;
    this.SelectedBPVendorOnBoarding.Type = this.SelectedBPVendorOnBoardingView.Type = this.VendorType;
    this.SelectedBPVendorOnBoarding.Role = this.SelectedBPVendorOnBoardingView.Role = 'Vendor';

    if (this.PanEnable) {
      this.SelectedBPVendorOnBoarding.GSTStatus = this.SelectedBPVendorOnBoardingView.GSTStatus = "false";
    }
    else {
      this.SelectedBPVendorOnBoarding.GSTStatus = this.SelectedBPVendorOnBoardingView.GSTStatus = "true";
    }
    this.SelectedBPVendorOnBoardingView.TypeofIndustry = this.SelectedBPVendorOnBoarding.TypeofIndustry = this.vendorRegistrationFormGroup.get('TypeOfIndustry').value;
    this.SelectedBPVendorOnBoarding.AccountGroup = this.SelectedBPVendorOnBoardingView.AccountGroup = this.BPVendorOnBoarding.AccountGroup;
    this.SelectedBPVendorOnBoarding.Department = this.SelectedBPVendorOnBoardingView.Department = this.BPVendorOnBoarding.Department;
    this.SelectedBPVendorOnBoarding.PurchaseOrg = this.SelectedBPVendorOnBoardingView.PurchaseOrg = this.BPVendorOnBoarding.PurchaseOrg;
    this.SelectedBPVendorOnBoarding.CompanyCode = this.SelectedBPVendorOnBoardingView.CompanyCode = this.BPVendorOnBoarding.CompanyCode;
    this.SelectedBPVendorOnBoarding.EmamiContactPerson = this.SelectedBPVendorOnBoardingView.EmamiContactPerson = this.BPVendorOnBoarding.EmamiContactPerson;
    this.SelectedBPVendorOnBoarding.EmamiContactPersonMail = this.SelectedBPVendorOnBoardingView.EmamiContactPersonMail = this.BPVendorOnBoarding.EmamiContactPersonMail;

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
    this.SelectedBPVendorOnBoarding.Token = this.SelectedBPVendorOnBoardingView.Token = this.VendorTokenCheck.token;
    this.SelectedBPVendorOnBoarding.TransID = this.SelectedBPVendorOnBoardingView.TransID = this.VendorTokenCheck.transID;
    this.SelectedBPVendorOnBoarding.GSTNumber = this.SelectedBPVendorOnBoardingView.GSTNumber = this.vendorRegistrationFormGroup.get('GSTNumber').value;
  }

  GetBPVendorOnBoardingSubItemValues(): void {
    this.GetBPIdentityValues();
    this.GetBPBankValues();
    this.GetBPContactValues();
    // this.GetQuestionsAnswers();
    this.GetBPActivityLogValues();
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
      if (x.Type) {
        this.SelectedBPVendorOnBoardingView.bPIdentities.push(x);
      }
    });
  }

  GetBPBankValues(): void {
    this.SelectedBPVendorOnBoardingView.bPBanks = [];
    // this.SelectedBPVendorOnBoardingView.BPBanks.push(...this.BanksByVOB);
    this.BanksByVOB.forEach(x => {
      if (x.AccountNo) {
        this.SelectedBPVendorOnBoardingView.bPBanks.push(x);
      }
    });
  }

  GetBPContactValues(): void {
    this.SelectedBPVendorOnBoardingView.bPContacts = [];
    // this.SelectedBPVendorOnBoardingView.bPIdentities.push(...this.IdentificationsByVOB);
    this.ContactsByVOB.forEach(x => {
      if (x.Name) {
        let string = x.Department.split(" ");
        console.log("GetBPContactValues", string[0]);
        x.Department = string[0];
        this.SelectedBPVendorOnBoardingView.bPContacts.push(x);
      }
    });
  }

  GetBPActivityLogValues(): void {
    this.SelectedBPVendorOnBoardingView.bPActivityLogs = [];
    // this.SelectedBPVendorOnBoardingView.BPBanks.push(...this.BanksByVOB);
    this.ActivityLogsByVOB.forEach(x => {
      this.SelectedBPVendorOnBoardingView.bPActivityLogs.push(x);
    });
  }

  CreateVendorOnBoarding(ActionType: string): void {
    this.GetBPVendorValues();
    this.GetBPVendorOnBoardingValues();
    this.GetBPVendorOnBoardingSubItemValues()
    // this.GetTableValues();
    const vendorUser: VendorUser = new VendorUser();
    vendorUser.Email = this.SelectedBPVendorOnBoardingView.Email1;
    vendorUser.Phone = this.SelectedBPVendorOnBoardingView.Phone1;

    console.log('IdentityTable', this.identificationDataSource.data);

    this.SelectedBPVendorOnBoarding.Plant = this.SelectedBPVendorOnBoardingView.Plant = this.BPVendorOnBoarding.Plant;

    const MSMEType = this.vendorRegistrationFormGroup.get('MSMEType').value;
    if (MSMEType === "Micro Enterprise") {
      this.SelectedBPVendorOnBoardingView.MSME_TYPE = this.SelectedBPVendorOnBoarding.MSME_TYPE = "MIC";
    } else if (MSMEType === "Small Enterprise") {
      this.SelectedBPVendorOnBoardingView.MSME_TYPE = this.SelectedBPVendorOnBoarding.MSME_TYPE = "SML"
    } else if (MSMEType === "Medium Enterprise") {
      this.SelectedBPVendorOnBoardingView.MSME_TYPE = this.SelectedBPVendorOnBoarding.MSME_TYPE = "MID"
    }
    else {
      this.SelectedBPVendorOnBoardingView.MSME_TYPE = this.SelectedBPVendorOnBoarding.MSME_TYPE = "OTH"
    }

    this.SelectedBPVendorOnBoarding.PANNumber = this.SelectedBPVendorOnBoardingView.PANNumber = this.vendorRegistrationFormGroup.get('PAN').value;
    this.SelectedBPVendorOnBoardingView.Status = ActionType === 'Save' ? ActionType : 'Registered';
    console.log('Save As Draft', this.SelectedBPVendorOnBoardingView, this.fileToUploadList);

    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.UpdateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.openSnackBar('Save Succussfully', SnackBarStatus.success);
        if (ActionType === 'Register') {
          this.ClearVendorRegistrationFormGroup();
          this.ClearIdentificationFormGroup();
          this.ClearBankDetailsFormGroup();
          this.IdentificationsByVOB = [];
          this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);

          this.BanksByVOB = [];
          this.bankDetailsDataSource = new MatTableDataSource<BPBank>(this.BanksByVOB);

          this.ContactsByVOB = [];
          this.contactDataSource = new MatTableDataSource<BPContact>(this.ContactsByVOB);
          // this._router.navigate(['/auth/login']);
        }
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }
  OpenSaveDialog(): void {
    const dialogConfig: MatDialogConfig = {
      panelClass: 'information-dialog',
      width: '1000px',
      disableClose: true
    };
    const dialogRef = this.dialog.open(InformationDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger, 5000);
    this.IsProgressBarVisibile = false;
  }

  UpdateVendorOnBoarding(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    this.SelectedBPVendorOnBoardingView.TransID = this.SelectedBPVendorOnBoarding.TransID;
    // this.SelectedBPVendorOnBoardingView.ModifiedBy = this.authenticationDetails.userID.toString();
    this.SelectedBPVendorOnBoardingView.Status = 'Registered';
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
    let first = false;
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
        // if (!first) {
        //   const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
        //   // invalidControl.focus();
        //   first = true;
        // }
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
    let IdentityCheck = [];
    // let IdentityCount=0;
    this.vendorRegistrationFormGroup.get('Type').patchValue(this.VendorType);
    if (this.vendorRegistrationFormGroup.valid) {
      let IdentityCount = 0;
      // const file: File = this.fileToUpload;
      this.GetBPVendorOnBoardingValues();
      this.GetBPVendorOnBoardingSubItemValues();
      if (choice.toLowerCase() === 'submit') {
        if (this.IdentificationsByVOB.length > 0 && this.IdentificationsByVOB[0].Type &&
          this.BanksByVOB.length > 0 && this.BanksByVOB[0].AccountNo &&
          this.ContactsByVOB.length > 0 && this.ContactsByVOB[0].Name) {


          this.IdentificationsByVOB.forEach(identity => {
            console.log("SaveClicked-identity", identity);
            let arrayData = [];
            let Datacount = 0;
            // for (let key in identity) {
            //   if (identity.hasOwnProperty(key)) {
            //     arrayData.push(identity[key]);
            //   }
            // }
            // console.log('arrayData',arrayData);
            // 
            // arrayData.forEach((element, index) => {
            //   if (element != null && index <= 6) {
            //     Datacount++;
            //   }
            // });
            if (identity.Type !== null) {
              Datacount++;
            }
            if (identity.AttachmentName !== null && identity.AttachmentName) {
              Datacount++;
            }
            let data = {
              'Type': identity.Type,
              'Count': Datacount
            }
            IdentityCheck.push(data);
            // }
          });
          console.log('IdentityCheck', IdentityCheck);
          for (let i = 0; i < IdentityCheck.length; i++) {
            if (IdentityCheck[i].Count < 2 && IdentityCheck[i].Type !== "Others") {
              let error = "Please Fill Records For " + IdentityCheck[i].Type + " Fields";
              this.openSnackBar(error, SnackBarStatus.danger);
              break;
            }
            else {
              IdentityCount++;
            }
            if (IdentityCount === this.identificationDataSource.data.length) {
              this.OpenConfirmationDialog('Register', 'Vendor');
              // window.alert('Ok');

            }
          }
          // IdentityCheck.forEach((data, index) => {

          //   if (data.Count < 2) {
          //     // if (this.MSMEMandatory && data.Type === "MSME Certificate") {
          //     //   this.openSnackBar('Please Fill Records For  All MSME Fields', SnackBarStatus.danger);
          //     //   return;
          //     // }
          //     // else {
          //     //   // if (this.vendorRegistrationFormGroup.get('MSMEType').value !== "Not Applicable") {
          //     //   //   let error = "Please Fill Records For  All" + data.Type + "Fields";
          //     //   //   this.openSnackBar(error, SnackBarStatus.danger);
          //     //   //   return;
          //     //   // }
          //     //   // if (this.vendorRegistrationFormGroup.get('MSMEType').value !== "Not Applicable") {
          //         let error = "Please Fill Records For  All " + data.Type + " Fields";
          //         this.openSnackBar(error, SnackBarStatus.danger);
          //         return;
          //       // }
          //     // }
          //   }
          //   // else if (this.MSMEMandatory) {
          //   //   this.openSnackBar('Please Fill Records For  All MSME Fields', SnackBarStatus.danger);
          //   //   return;
          //   // }
          //   else {
          //     IdentityCount++;
          //   }
          // });
          // if (IdentityCount === this.identificationDataSource.data.length) {
          //   this.OpenConfirmationDialog('Register', 'Vendor');
          //   // this.SetActionToOpenConfirmation('Register');
          // }
          // else {
          //   if (!this.MSMEMandatory) {
          //     this.OpenConfirmationDialog('Register', 'Vendor');

          //     // this.SetActionToOpenConfirmation('Register');
          //   }
          // }
        }
        else {
          let errorMsg = 'Please add atleast one record for';
          if (this.IdentificationsByVOB.length <= 0 || !this.IdentificationsByVOB[0].Type) {
            errorMsg += ' Identity,';
          }
          if (this.BanksByVOB.length <= 0 || !this.BanksByVOB[0].AccountNo) {
            errorMsg += ' Bank,';
          }
          if (this.ContactsByVOB.length <= 0 || !this.ContactsByVOB[0].Name) {
            errorMsg += ' Contact';
          }
          errorMsg = errorMsg.replace(/,\s*$/, '');
          this.notificationSnackBarComponent.openSnackBar(`${errorMsg}`, SnackBarStatus.danger);
        }
      }
      else {
        this.SetActionToOpenConfirmation('Register');
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
      this.openSnackBar('Please fill all Required fields in Basic details', SnackBarStatus.danger);
      this.ShowValidationErrors(this.vendorRegistrationFormGroup);
    }
  }
  savedraft(): void {
    if (this.vendorRegistrationFormGroup.get('Email1').valid) {

      this.SetActionToOpenConfirmation('Save');
    }
    else {
      this.notificationSnackBarComponent.openSnackBar('Please Enter Email1 Field to save as Draft', SnackBarStatus.danger);
    }
  }
  GetTableValues(): void {
    this.BanksByVOB.forEach((bank, index) => {
      this.BanksByVOB[index].TransID = this.VendorTokenCheck.transID;
    });
    this.SelectedBPVendorOnBoardingView.bPBanks = this.BanksByVOB;

    this.ContactsByVOB.forEach((contact, index) => {
      this.ContactsByVOB[index].TransID = this.VendorTokenCheck.transID;
    });
    this.SelectedBPVendorOnBoardingView.bPContacts = this.ContactsByVOB;

    this.IdentificationsByVOB.forEach((Identity, index) => {
      this.IdentificationsByVOB[index].TransID = this.VendorTokenCheck.transID;
    });
    this.SelectedBPVendorOnBoardingView.bPIdentities = this.IdentificationsByVOB;
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
    // if (evt.target.files && evt.target.files.length > 0) {
    //   this.fileToUpload = evt.target.files[0];
    //   // evt.target.files[0] = null;
    //   // this.fileToUpload=null;
    //   if (this.SelectedIdentity && this.SelectedIdentity.Type) {
    //     const selectFileName = this.SelectedIdentity.AttachmentName;
    //     // this.fileToUpload=null;
    //     const indexx = this.IdentificationsByVOB.findIndex(x => x.Type === this.SelectedIdentity.Type && x.IDNumber === this.SelectedIdentity.IDNumber);
    //     this.fileToUpload = null;
    //     if (indexx > -1) {
    //       this.IdentificationsByVOB[indexx].AttachmentName = this.fileToUpload.name;
    //       this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
    //       this.fileToUploadList.push(this.fileToUpload);
    //       this.fileToUpload = null;

    //       if (selectFileName) {
    //         const fileIndex = this.fileToUploadList.findIndex(x => x.name === selectFileName);
    //         if (fileIndex > -1) {
    //           this.fileToUploadList.splice(fileIndex, 1);
    //         }
    //       }
    //       this.fileToUpload = null;

    //     }
    //     this.SelectedIdentity = new BPIdentity();
    //   }
    //   this.fileToUploadList.push(this.fileToUpload);
    //   // this.SelectedIdentity = new BPIdentity();
    // }

    // if (evt.target.files && evt.target.files.length > 0) {
    //   this.fileToUpload = evt.target.files[0];

    //   const FileIndex = this.fileToUploadList.findIndex(x => x.name === this.fileToUpload.name);
    //   if (FileIndex >= 0) {
    //     this.openSnackBar('Duplicate Attachment Found', SnackBarStatus.danger);
    //   }
    //   else {
    //     this.fileToUploadList.push(this.fileToUpload);
    //   }
    // }
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
    }
  }
  MSMETypeChange(event): void {
    console.log("this.IdentificationsByVOB = ",this.IdentificationsByVOB);
    if (event.value === "Not Applicable") {
      this.MSMEMandatory = false;
      let index = this.IdentificationsByVOB.findIndex(x => x.Type === "MSME Certificate");
      if(index >=0)
      {
        this.AllIdentityTypes.forEach((type, indexs) => {
          if (type === "MSME Certificate") {
            this.AllIdentityTypes.splice(indexs, 1);
          }
        });
        this.MSMERow = this.IdentificationsByVOB[index];
        this.IdentificationsByVOB.splice(index, 1);
        this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
      }
      else
      {
        window.alert('Error'+ index);
      }
    }
    else {
      this.MSMEMandatory = true;
      if (this.IdentificationsByVOB.findIndex(x => x.Type === "MSME Certificate") < 0) {
        this.MSMERow.Type="MSME Certificate";
        this.IdentificationsByVOB.push(this.MSMERow);
        this.AllIdentityTypes.push('MSME Certificate');
        this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
      }
    }
    // console.log("MSMETypeChange", event);
  }
  handleFileInput2(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload1 = evt.target.files[0];
      if (this.SelectedBank && this.SelectedBank.AccountNo) {
        const selectFileName = this.SelectedBank.AttachmentName;
        const indexx = this.BanksByVOB.findIndex(x => x.AccountNo === this.SelectedBank.AccountNo && x.IFSC === this.SelectedBank.IFSC);
        if (indexx > -1) {
          this.BanksByVOB[indexx].AttachmentName = this.fileToUpload1.name;
          this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
          this.fileToUploadList.push(this.fileToUpload1);
          if (selectFileName) {
            const fileIndex = this.fileToUploadList.findIndex(x => x.name === selectFileName);
            if (fileIndex > -1) {
              this.fileToUploadList.splice(fileIndex, 1);
            }
          }
          this.fileToUpload1 = null;
        }
        this.SelectedBank = new BPBank();
      }
      // this.fileToUploadList.push(this.fileToUpload);
    }
  }
  ReplaceIdentificationAttachment(element: BPIdentity): void {
    // const el: HTMLElement = this.fileInput.nativeElement;
    // el.click();
    this.SelectedIdentity = element;
    const event = new MouseEvent('click', { bubbles: false });
    this.fileInput.nativeElement.dispatchEvent(event);
  }
  ReplaceBankAttachment(element: BPBank): void {
    // const el: HTMLElement = this.fileInput.nativeElement;
    // el.click();
    this.SelectedBank = element;
    const event = new MouseEvent('click', { bubbles: false });
    this.fileInput2.nativeElement.dispatchEvent(event);
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


  GetIdentAttachment(element: BPIdentity): void {
    const fileName = element.AttachmentName;
    const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      saveAs(blob, fileName);

      // this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.DowloandAttachmentByIDAndName(element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                    fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
            const blob = new Blob([data], { type: fileType });
            saveAs(blob, fileName);
            // this.OpenAttachmentDialog(fileName, blob);
          }
          this.IsProgressBarVisibile = false;
        },
        error => {
          console.error(error);
          this.IsProgressBarVisibile = false;
        }
      );
    }
  }
  GetBankAttachment(element: BPBank): void {
    const fileName = element.AttachmentName;
    const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      saveAs(blob, fileName);

      // this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.DowloandAttachmentByIDAndName(element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                    fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
            const blob = new Blob([data], { type: fileType });
            saveAs(blob, fileName);
            // this.OpenAttachmentDialog(fileName, blob);
          }
          this.IsProgressBarVisibile = false;
        },
        error => {
          console.error(error);
          this.IsProgressBarVisibile = false;
        }
      );
    }
  }
  OpenAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    console.log(FileName, "filee--------", blob);
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  GetAllOnBoardingFieldMaster(): void {
    this._vendorMasterService.GetAllOnBoardingFieldMaster().subscribe(
      (data) => {
        this.AllOnBoardingFieldMaster = data as CBPFieldMaster[];
        this.InitializeVendorRegistrationFormGroupByFieldMaster();
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetOBDFieldLabel(field: string): string {
    if (this.AllOnBoardingFieldMaster && this.AllOnBoardingFieldMaster.length) {
      const fieldMaster = this.AllOnBoardingFieldMaster.filter(x => x.Field === field)[0];
      if (fieldMaster) {
        return fieldMaster.Text;
      }
    }
    return field;
  }

  GetOBDFieldVisibility(field: string): string {
    if (this.AllOnBoardingFieldMaster && this.AllOnBoardingFieldMaster.length) {
      const fieldMaster = this.AllOnBoardingFieldMaster.filter(x => x.Field === field)[0];
      if (fieldMaster) {
        if (fieldMaster.Invisible) {
          return 'none';
        }
      }
    }
    return 'inherit';
  }
  GetOBDFieldMaster(field: string): CBPFieldMaster {
    if (this.AllOnBoardingFieldMaster && this.AllOnBoardingFieldMaster.length) {
      return this.AllOnBoardingFieldMaster.filter(x => x.Field === field)[0];
    }
    return null;
  }
  InitializeVendorRegistrationFormGroupByFieldMaster(): void {
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      const fieldMaster = this.GetOBDFieldMaster(key);
      if (fieldMaster) {
        if (fieldMaster.Invisible) {
          this.vendorRegistrationFormGroup.get(key).clearValidators();
          this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
        } else {
          if (fieldMaster.DefaultValue) {
            this.vendorRegistrationFormGroup.get(key).patchValue(fieldMaster.DefaultValue);
          } else {
            // this.vendorRegistrationFormGroup.get(key).patchValue('');
          }
          if (fieldMaster.Mandatory) {
            if (key === 'Phone1') {
              // this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^[0-9]{2,5}([- ]*)[0-9]{6,8}$')]);
            } else if (key === 'Phone2') {
              // this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
            } else if (key === 'Email1') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
            } else if (key === 'Email2') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
            } else if (key === 'Name') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.maxLength(40)]);
            } else if (key === 'LegalName') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.maxLength(40)]);
            } else if (key === 'PinCode') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^\\d{6,10}$')]);
            }
            else {
              this.vendorRegistrationFormGroup.get(key).setValidators(Validators.required);
            }
            this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
          } else {
            if (key === 'Phone1') {
              // this.vendorRegistrationFormGroup.get(key).setValidators([Validators.pattern('^[0-9]{2,5}([- ]*)[0-9]{6,8}$')]);
            } else if (key === 'Phone2') {
              // this.vendorRegistrationFormGroup.get(key).setValidators([Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
            } else if (key === 'Email1') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
            } else if (key === 'Email2') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
            } else if (key === 'Name') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.maxLength(40)]);
            } else if (key === 'LegalName') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.maxLength(40)]);
            } else if (key === 'PinCode') {
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.pattern('^\\d{6,10}$')]);
            }
            else {
              this.vendorRegistrationFormGroup.get(key).clearValidators();
            }
            this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
          }

        }
      }
    });
    // this.InitializeVendorRegistrationFormGroupByQueryString();
  }
  GetDataByGSTNumber(): void {
    this.IsProgressBarVisibile = true;
    if (this.vendorRegistrationFormGroup.get('GSTNumber').valid) {
      // this._vendorMasterService.GetTaxPayerDetails(this.vendorRegistrationFormGroup.get('GSTNumber').value).subscribe(
      //   (data) => {
      //     const TaxPayer = data as TaxPayerDetails;
      //     // TaxPayer=data;
      //     console.log('TaxPayer', TaxPayer);
      //     this.vendorRegistrationFormGroup.get('Name').patchValue(TaxPayer.tradeName);
      //     this.vendorRegistrationFormGroup.get('LegalName').patchValue(TaxPayer.legalName);
      //     this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(TaxPayer.address1);
      //     // this.addressline1.push(TaxPayer.address1);
      //     this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(TaxPayer.address2);
      //     this.vendorRegistrationFormGroup.get('PinCode').patchValue(TaxPayer.pinCode);
      //     this.GSTStatusCode = TaxPayer.stateCode;
      //     if (TaxPayer.pinCode !== null) {
      //       this._vendorMasterService.GetLocation(TaxPayer.pinCode).subscribe(
      //         (data) => {
      //           console.log('GetLocation', data);
      //           if (data != null) {
      //             this.Postaldata = false;
      //             this.vendorRegistrationFormGroup.get('City').patchValue(data[0].PostOffice[0].Division);
      //             this.vendorRegistrationFormGroup.get('State').patchValue(data[0].PostOffice[0].State);
      //             this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].PostOffice[0].Country);
      //             this.IsProgressBarVisibile = false;
      //           }
      //           else {
      //             this.openSnackBar('Please Enter GSTNumber', SnackBarStatus.danger);
      //             this.IsProgressBarVisibile = false;
      //           }
      //         }
      //       );
      //     }
      //   }
      // );
      this._vendorMasterService.SearchTaxPayer(this.vendorRegistrationFormGroup.get('GSTNumber').value).subscribe(
        (data) => {
          console.log('Data from SearchTaxPayer', data);
          if (data) {

            let pan = this.vendorRegistrationFormGroup.get('GSTNumber').value as string;
            pan = pan.substring(2, 10);
            this.vendorRegistrationFormGroup.get('PAN').patchValue(pan);
            const TaxPayer = data as TaxPayerDetails;
            // TaxPayer=data;
            console.log('TaxPayer', TaxPayer);
            this.vendorRegistrationFormGroup.get('Name').patchValue(TaxPayer.tradeName);
            this.vendorRegistrationFormGroup.get('LegalName').patchValue(TaxPayer.legalName);
            this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(TaxPayer.address1);
            // this.addressline1.push(TaxPayer.address1);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(TaxPayer.address2);
            this.vendorRegistrationFormGroup.get('PinCode').patchValue(TaxPayer.pinCode);
            this.GSTStatusCode = TaxPayer.stateCode;
            if (TaxPayer.pinCode !== null) {
              this._vendorMasterService.GetLocationByPincode(TaxPayer.pinCode).subscribe(
                (Loc) => {
                  const postal = Loc as CBPLocation;

                  if (Loc != null) {
                    this.Postaldata = false;
                    this.vendorRegistrationFormGroup.get('City').patchValue(postal.District);
                    this.vendorRegistrationFormGroup.get('State').patchValue(postal.State);
                    this.vendorRegistrationFormGroup.get('Country').patchValue(postal.Country);
                    this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(postal.Taluk + ',' + postal.State);
                    this.IsProgressBarVisibile = false;
                  }
                }
              );
            }
            this.vendorRegistrationFormGroup.get('Name').disable();
            this.vendorRegistrationFormGroup.get('LegalName').patchValue(TaxPayer.legalName);
            // this.vendorRegistrationFormGroup.get('AddressLine1').disable();
            // this.addressline1.push(TaxPayer.address1);
            this.vendorRegistrationFormGroup.get('AddressLine2').disable();
            this.vendorRegistrationFormGroup.get('PinCode').disable();
            this.vendorRegistrationFormGroup.get('City').disable();
            this.vendorRegistrationFormGroup.get('State').disable();
            this.vendorRegistrationFormGroup.get('Country').disable();

            // const GSTIndex = this.IdentificationsByVOB.findIndex(x => x.Type === "GST");
            // if (GSTIndex >= 0) {
            //   this.IdentificationsByVOB[GSTIndex].IDNumber = this.vendorRegistrationFormGroup.get('GSTNumber').value;
            // }
            // const PANIndex = this.IdentificationsByVOB.findIndex(x => x.Type === "PAN");
            // if (PANIndex >= 0) {
            //   let Pan = this.vendorRegistrationFormGroup.get('GSTNumber').value;
            //   Pan = Pan.substr(2, 10);
            //   console.log('GST Number', Pan, 'Pan', Pan);
            //   this.IdentificationsByVOB[PANIndex].IDNumber = Pan;
            // }
            let Pan = this.vendorRegistrationFormGroup.get('GSTNumber').value;
            Pan = Pan.substr(2, 10);
            this.vendorRegistrationFormGroup.get('PAN').patchValue(Pan);
            this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
          }
          else {
            this.IsProgressBarVisibile = false;
            this.vendorRegistrationFormGroup.get('Name').enable();
            // this.vendorRegistrationFormGroup.get('LegalName').patchValue(TaxPayer.legalName);
            this.vendorRegistrationFormGroup.get('AddressLine1').enable();
            // this.addressline1.push(TaxPayer.address1);
            this.vendorRegistrationFormGroup.get('AddressLine2').enable();
            this.vendorRegistrationFormGroup.get('PinCode').enable();
            this.vendorRegistrationFormGroup.get('City').enable();
            this.vendorRegistrationFormGroup.get('State').enable();
            this.vendorRegistrationFormGroup.get('Country').enable();
            // console.log('Error in GSTNumber', data);
            this.openSnackBar('No Records Found', SnackBarStatus.danger);
          }
        },
        (err) => {
          // console.log('Error', err);
          this.openSnackBar('No Records Found', SnackBarStatus.danger);
          this.IsProgressBarVisibile = false;
        }
      );
    }
    else {
      this.openSnackBar('Please Enter GST Number', SnackBarStatus.danger);
      this.IsProgressBarVisibile = false;
    }
  }
  InitializeVendorRegistrationFormGroupByQueryString(): void {
    const Token: any = this._activatedRoute.snapshot.queryParamMap.get('Token');
    console.log(Token, "toooken")
    if (Token !== 'null') {
      let reverseDate = Token.reverse();
      reverseDate = reverseDate.join('');
      // console.log(reverseDate,"--------")
      const dateToken = reverseDate.slice(0, 8);
      // console.log(dateToken);
      const timeToken = reverseDate.slice(8);
      //  console.log(timeToken);

      let yearToken = dateToken.slice(0, 4);
      let monthToken = dateToken.slice(4, 6) - 1;
      let dayToken = dateToken.slice(6, 8);
      let hrToken = timeToken.slice(0, 2);
      let minToken = timeToken.slice(2, 4);
      let secToken = timeToken.slice(4, 6);

      let validToken = new Date(yearToken, monthToken, dayToken, hrToken, minToken, secToken);
      let currentDate = new Date();

      //  console.log(validToken,"getting valid token",currentDate,"----- current date")

      if (validToken < currentDate) {
        //  console.log("not autenticated",validToken<currentDate);
        this.notificationSnackBarComponent.openSnackBar('Your Details are Expiry', SnackBarStatus.danger, 5000);
      }
      else {
        //  console.log('---------',validToken<currentDate);
        const Plant = this._activatedRoute.snapshot.queryParamMap.get('Plant');

        const Name = this._activatedRoute.snapshot.queryParamMap.get('Name');
        if (Name) {
          this.vendorRegistrationFormGroup.get('Name').patchValue(Name);
        }
        const Email1 = this._activatedRoute.snapshot.queryParamMap.get('Email');
        if (Email1) {
          this.vendorRegistrationFormGroup.get('Email1').patchValue(Email1);
        }
        const VendorType = +this._activatedRoute.snapshot.queryParamMap.get('VendorType');
        if (VendorType) {
          this.vendorRegistrationFormGroup.get('Type').patchValue(VendorType.toString());
        }
        const GSTNo = this._activatedRoute.snapshot.queryParamMap.get('GSTNo');
        if (GSTNo) {
          this.AddIdentificationToTableFromTaxPayerDetails(GSTNo, 'GSTIN');
          const pan_id = GSTNo.substring(2, 12);
          this.AddIdentificationToTableFromTaxPayerDetails(pan_id, 'PAN CARD');
        }
      }
    }
  }
  GSTCheckBoxEvent(event = null): void {
    if (event != null) {
      this.PanEnable = event.checked;
      // console.log('Event is not null');
    }
    if (this.PanEnable) {
      this.GSTCheckBox = true;
      console.log('GSTCheckBoxEvent', this.GSTCheckBox);
      let name = this.vendorRegistrationFormGroup.get('Name').value;
      let email1 = this.vendorRegistrationFormGroup.get('Email1').value;
      this.ClearVendorRegistrationFormGroup();
      this.vendorRegistrationFormGroup.get('GSTNumber').disable();
      this.vendorRegistrationFormGroup.get('PAN').enable();
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue('Not Applicable');
      this.vendorRegistrationFormGroup.get('Name').enable();
      this.vendorRegistrationFormGroup.get('AddressLine2').enable();
      this.vendorRegistrationFormGroup.get('PinCode').enable();
      this.vendorRegistrationFormGroup.get('City').enable();
      this.vendorRegistrationFormGroup.get('State').enable();
      this.vendorRegistrationFormGroup.get('Country').enable();

      this.vendorRegistrationFormGroup.get('Name').patchValue(name);
      this.vendorRegistrationFormGroup.get('Email1').patchValue(email1);
      this.AllIdentityTypes.forEach((types, index) => {
        let StringType = types as string;
        if (StringType.includes('GST')) {
          this.AllIdentityTypes.splice(index, 1);
        }
      });
      let IdentityTableIndex = this.IdentificationsByVOB.findIndex(x => x.Type === "GST");
      if (IdentityTableIndex >= 0) {
        this.IdentificationsByVOB.splice(IdentityTableIndex, 1);
      }
      this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
    }
    else {
      let temp = -1;
      this.GSTCheckBox = false;
      console.log('GSTCheckBoxEvent', this.GSTCheckBox);
      this.vendorRegistrationFormGroup.get('GSTNumber').enable();
      this.vendorRegistrationFormGroup.get('PAN').disable();
      this.AllIdentityTypes.forEach(element => {
        if (element === "GST") {
          temp = 0;
        }
      });
      if (temp < 0) {
        this.AllIdentityTypes.push("GST");
      }

      let IdentityTableIndex = this.IdentificationsByVOB.findIndex(x => x.Type === "GST");
      if (IdentityTableIndex < 0) {
        // this.AllIdentityTypes.push("GST");
        const identity = new BPIdentity();
        identity.Type = "GST";
        this.IdentificationsByVOB.push(identity);
        this.identificationDataSource = new MatTableDataSource<BPIdentity>(this.IdentificationsByVOB);
      }
    }
  }

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

