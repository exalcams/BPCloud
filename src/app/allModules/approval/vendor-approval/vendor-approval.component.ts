import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuApp, AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { BPVendorOnBoarding, BPVendorOnBoardingView, BPIdentity, BPBank, BPContact, BPActivityLog } from 'app/models/vendor-registration';
import { MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CBPFieldMaster, CBPLocation, StateDetails } from 'app/models/vendor-master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Guid } from 'guid-typescript';
import { AttachmentDetails } from 'app/models/attachment';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {FormControl} from '@angular/forms';
import { PhoneDilaogComponent } from '../phone-dilaog/phone-dilaog.component';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-vendor-approval',
  templateUrl: './vendor-approval.component.html',
  styleUrls: ['./vendor-approval.component.scss']
})
export class VendorApprovalComponent implements OnInit {
  SelectedID: number;
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsDisplayPhone2: boolean;
  IsDisplayEmail2: boolean;
  vendorRegistrationFormGroup: FormGroup;
  identificationFormGroup: FormGroup;
  bankDetailsFormGroup: FormGroup;
  contactFormGroup: FormGroup;
  // activityLogFormGroup: FormGroup;
  searchText = '';
  AllVendorOnBoardings: BPVendorOnBoarding[] = [];
  selectID: number;
  SelectedBPVendorOnBoarding: BPVendorOnBoarding;
  SelectedBPVendorOnBoardingView: BPVendorOnBoardingView;
  IdentificationsByVOB: BPIdentity[] = [];
  BanksByVOB: BPBank[] = [];
  ContactsByVOB: BPContact[] = [];
  // ActivityLogsByVOB: BPActivityLog[] = [];
  identificationDisplayedColumns: string[] = [
    'firstcolumn',
    'Type',
    // 'IDNumber',
    'ValidUntil',
    'Attachment',
    // 'Action'
  ];
  bankDetailsDisplayedColumns: string[] = [
    'firstcolumn',
    'AccountNo',
    'Name',
    'IFSC',
    'BankName',
    'Branch',
    'City',
    // 'Attachment',
    // 'Action'
  ];

  contactDisplayedColumns: string[] = [
    'firstcolumn',
    'Name',
    'Department',
    'Title',
    'Mobile',
    'Email',
    // 'Action'
  ];
  // activityLogDisplayedColumns: string[] = [
  //   'Activity',
  //   'Date',
  //   'Time',
  //   'Text',
  //   // 'Action'
  // ];
  identificationDataSource = new MatTableDataSource<BPIdentity>();
  bankDetailsDataSource = new MatTableDataSource<BPBank>();
  contactDataSource = new MatTableDataSource<BPContact>();
  // activityLogDataSource = new MatTableDataSource<BPActivityLog>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild('iDNumber') iDNumber: ElementRef;
  @ViewChild('validUntil') validUntil: ElementRef;
  @ViewChild('accHolderName') accHolderName: ElementRef;
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
  math = Math;
  BPVendorOnBoarding: BPVendorOnBoarding;
  AllIdentityTypes: string[] = [];
  lanline:any[]=[]
  AllRoles: string[] = [];
  AllTypes: any[] = [];
  AllCountries: any[] = [];
  AllStates: StateDetails[] = [];
  PanEnable=false;
  AllOnBoardingFieldMaster: CBPFieldMaster[] = [];
  inputvalue = '';
  codeselected='';
  myControl = new FormControl();
  myControl1=new FormControl();
  myControl2=new FormControl();
  emailvalue ='';
  Phone1_ng:any;
  Phone2_ng:any;
  titlevalue='';
  land_num1:any;
  type_option: any;
  len: any;
  phone1: any;
  phone1_error: string;
  i: any;
  pin_first: any;
  pin_first1: any=[];
  pincode:any[]=[];
  n: number;
  j: any;
  n1: any;
  Country:string;
  result: any;
  result2:any;
  dialogRef: any;
  result1: any;
  filteredlandline: Observable<any[]>;
  filteredlandline1: Observable<any[]>;
  land_num: any;
  count1: any=0;
  country_india: any;
  country_india_lower: any;
  VendorType: string;
  Industrytype: string;
  showCheckBox=false;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _vendorRegistrationService: VendorRegistrationService,
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialog1: MatDialog,
    private _formBuilder: FormBuilder
  ) {
    // this._fuseConfigService.config = {
    //   layout: {
    //     navbar: {
    //       hidden: true
    //     },
    //     toolbar: {
    //       hidden: true
    //     },
    //     footer: {
    //       hidden: true
    //     },
    //     sidepanel: {
    //       hidden: true
    //     }
    //   }
    // };
    this.SelectedBPVendorOnBoarding = new BPVendorOnBoarding();
    this.SelectedBPVendorOnBoardingView = new BPVendorOnBoardingView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.AllRoles = ['Vendor', 'Customer'];
    // this.AllTypes = ['Manufacturer', 'Service Provider', 'Tranporter', 'Others'];
    // this.AllTypes = ['Domestic supply', 'Domestic Service', 'Import vendor', 'Others'];
    this.AllTypes = [
      { Key: 'Domestic supply', Value: '1' },
      { Key: 'Domestic Service', Value: '2' },
      { Key: 'Import vendor', Value: '3' },
    ];
  }

  ngOnInit(): void {
    // const retrievedObject = localStorage.getItem('authorizationData');
    // if (retrievedObject) {
    //   this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    //   this.CurrentUserID = this.authenticationDetails.userID;
    //   this.CurrentUserRole = this.authenticationDetails.userRole;
    //   this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
    // if (this.MenuItems.indexOf('Dashboard') < 0) {
    //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
    //     );
    //     this._router.navigate(['/auth/login']);
    // }
    this._activatedRoute.params.subscribe(x => {
      if (x['ID']) {
        this.SelectedID = +x['ID'];
      }
    });
    if (this.SelectedID) {
      // console.log(this.SelectedID);
      this.GetVendorOnBoardingsByID();
    }
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
    this.GetAllOnBoardingFieldMaster();
    this.GetAllIdentityTypes();
    this.GetStateDetails();
    this.InitializeVendorRegistrationFormGroup();
    this.InitializeIdentificationFormGroup();
    this.InitializeBankDetailsFormGroup();
    this.InitializeContactFormGroup();
 

    // this.InitializeActivityLogFormGroup();
    // this.GetRegisteredVendorOnBoardings();
    // } else {
    //   this._router.navigate(['/auth/login']);
    // }
  }
  private _filterlandline(value: string): any {
    const filterValue1 = value.toLowerCase();
console.log("landline below")
    console.log(this.lanline.filter( landline => landline.num.indexOf(filterValue1) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue1) === 0);
    
  }
  private _filterlandline1(value: string): any {
    const filterValue2 = value.toLowerCase();
// console.log("landline below")
    console.log(this.lanline.filter( landline => landline.num.indexOf(filterValue2) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue2) === 0);
    
  }
  phonelandline(){

  }
  private _filterstate(value: any): any[] {
    const filterValuestate = value.toLowerCase();

    return this.AllStates.filter(sta => sta.State.toLowerCase().indexOf(filterValuestate) === 0);
  }
  landlinefunc(num){
    console.log("num"+num)
   console.log("mycontrol" +this.myControl1.get("landline.num"));

   this.land_num=num;
  //  this.vendorRegistrationFormGroup.get('Phone1').markAsTouched();
  }
  landlinefunc1(num){
    console.log("num"+num)
   console.log("mycontrol2" +this.myControl2.get("landline.num"));

   this.land_num1=num;
  //  this.vendorRegistrationFormGroup.get('Phone1').markAsTouched();
  }
 
  onArrowBackClick(): void {
    this._router.navigate(['/pages/dashboard']);
  }

  GetVendorOnBoardingsByID(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetVendorOnBoardingsByID(this.SelectedID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        // const type=data.
        this.BPVendorOnBoarding = <BPVendorOnBoarding>data;
        if(this.BPVendorOnBoarding.Type === "Import Vendor")
        {
          this.showCheckBox=false;
        }
        else
        {
          this.showCheckBox=true;
        }
        if (this.BPVendorOnBoarding.GSTStatus === "true") {
          this.PanEnable = false;

        } else {
          if (this.BPVendorOnBoarding.GSTStatus != null) {
            this.PanEnable = true;
          }
        }
        this.Industrytype=data.TypeofIndustry;
        console.log('this.BPVendorOnBoarding',this.BPVendorOnBoarding,this.BPVendorOnBoarding.TypeofIndustry);
        if (this.BPVendorOnBoarding) {
          this.VendorType=this.BPVendorOnBoarding.Type;
          this.loadSelectedBPVendorOnBoarding(this.BPVendorOnBoarding);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
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

  InitializeVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup = this._formBuilder.group({
      Name: ['', [Validators.required, Validators.maxLength(40)]],
      Role: ['Vendor', Validators.required],
      LegalName: ['', [Validators.required, Validators.maxLength(40)]],
      AddressLine1: ['', Validators.required],
      AddressLine2: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
      GST:[''],
      PAN:[''],
      MSMEType: ['', Validators.required],
      TypeOfIndustry: [''],
      Country: ['India', [Validators.required]],
      // ,this.countryDomain
      PinCode: ['', [Validators.required, Validators.pattern('^\\d{4,10}$')]],
      Type: [''],
      // Invoice:[''],
      Phone1: ['',  [Validators.required,Validators.maxLength(15),Validators.pattern("^[0-9]{7,15}$")]],
      Phone2: ['', [Validators.maxLength(15),Validators.pattern("^[0-9]{7,15}$")]], 
          Email1: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      Email2: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
     
    });
    this.vendorRegistrationFormGroup.get('City').disable();
    this.vendorRegistrationFormGroup.get('State').disable();
    this.vendorRegistrationFormGroup.get('Country').disable();
  }
  phoneDomain1(control: AbstractControl): { [key: string]: any } | null {
    const phone:any=control.value.toString();//to find the length converted as string
    if (phone && phone.length > 15) {
      return { 'phoneNumberInvalid': true };
  }
  else{
  return null;}
  }
  phone1_dialog(){
    if(this.count1 ==0){
   this.dialogRef= this.dialog1.open(PhoneDilaogComponent);
   this.dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // this.GetTaxPayerDetails(result);
      console.log("result final"+result)
     if(result==1){
       this.result1="Moblile"
     }
     else if(result==2){
      this.result1="Landline"
     }
    }
    else if(!result){

      // this.notificationSnackBarComponent.openSnackBar(`Please enter Valid GSTIN`, SnackBarStatus.danger, 5000);
    }
  });
// console.log("hii");
    }
  }
  phone1_dialog1(){
    if(this.count1 ==0){
   this.dialogRef= this.dialog1.open(PhoneDilaogComponent);
   this.dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // this.GetTaxPayerDetails(result);
      console.log("result final"+result)
     if(result==1){
       this.result2="Moblile"
     }
     else if(result==2){
      this.result2="Landline"
     }
    }
    else if(!result){

      // this.notificationSnackBarComponent.openSnackBar(`Please enter Valid GSTIN`, SnackBarStatus.danger, 5000);
    }
  });
// console.log("hii");
    }
  }
  pinfunc(){
    this.j=0
      this.n1=this.pincode.length
      this.pin_first1=this.vendorRegistrationFormGroup.get('PinCode').value;
  this.pin_first=this.pin_first1.slice(0,1)
  this.pin_first=Number(this.pin_first)
  // this.pin_first=this.pin_first
  for(this.j;this.j<this.n1;this.j++){
    if(this.pincode[this.j].num==this.pin_first1 && this.type_option=="Import vendor"){
      this.vendorRegistrationFormGroup.get('PinCode').markAsTouched();
      this.vendorRegistrationFormGroup.controls['PinCode'].setErrors({'incorrect': true});
  
    }
  }
    } 
    countryDomain(control: AbstractControl): { [key: string]: any } | null {
      // this.countryfunc();
      const country:any=control.value;
      
      if (country && country =="India") {
     
        return { 'countryInvalid': true };
     
    }
    else{
    return null;}
    }
    countryfunc(){
      // console.log(event);
      // console.log("country:"+this.Country)
      const country=this.Country.toLocaleLowerCase()
      
      if(country=="india" && this.type_option=="Import vendor"){
  
       this.vendorRegistrationFormGroup.get("Country").markAsTouched();
       this.vendorRegistrationFormGroup.controls['Country'].setErrors({'incorrect': true});
      // this.vendorRegistrationFormGroup.get('Country').patchValue("");
      }
    }
    phoneDomain() {
      // const phone:any=this.Phone1_ng.value;//to find the length converted as string
      // const phone:any=this.Phone1_ng.value.toString();//to find the length converted as string
    // =
  this.len=this.Phone1_ng.length;
  console.log(this.len)
      if (this.Phone1_ng && this.len> 15)
       {
        // this.vendorRegistrationFormGroup.get("Phone1").markAsTouched();
        this.vendorRegistrationFormGroup.controls['Phone1'].setErrors({'incorrect': true});
        this.phone1_error="only 15 number is allowed";
    }
  }
Countrycodefunc(country){


  console.log("country:"+country);
  this.codeselected=country.countycode
  console.log(this.codeselected)
  }

  InitializeIdentificationFormGroup(): void {
    this.identificationFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      IDNumber: ['', Validators.required],
      ValidUntil: ['', Validators.required],
    });
  }
  typefunc(type){
    console.log(type);
    this.type_option=type.Key;
    if((type.Key=="Domestic Supply") || (type.Key=="Domestic Service")){
     this.codeselected="+91"
    }
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
    // this.fileToUpload = null;
    this.ClearIdentificationFormGroup();
    this.ClearBankDetailsFormGroup();
    this.ClearContactFormGroup();
    // this.ClearActivityLogFormGroup();
    this.ClearIdentificationDataSource();
    this.ClearBankDetailsDataSource();
    this.ClearContactDataSource();
    // this.ClearActivityLogDataSource();
  }

  ClearIdentificationFormGroup(): void {
    this.identificationFormGroup.reset();
    Object.keys(this.identificationFormGroup.controls).forEach(key => {
      this.identificationFormGroup.get(key).markAsUntouched();
    });
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

  // ClearActivityLogFormGroup(): void {
  //   this.activityLogFormGroup.reset();
  //   Object.keys(this.activityLogFormGroup.controls).forEach(key => {
  //     this.activityLogFormGroup.get(key).markAsUntouched();
  //   });
  // }

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
  TypeSelected(event): void {
    if (event.value) {
      const selecteType = event.value as string;
      if (selecteType && selecteType === '3') {
        this.vendorRegistrationFormGroup.get('Country').enable();
        this.count1="1";
        this.result1="Moblile";
        this.result2="Moblile";
      } else {
        this.vendorRegistrationFormGroup.get('Country').disable();
      }
      if(selecteType && selecteType === '2'){
        this.codeselected="+91";
        this.count1="0"
      }
      if(selecteType && selecteType === '1'){
        this.count1="0"
      }
    }
    

  }
  CountrySelected(val: string): void {
    if (val) {
      this.vendorRegistrationFormGroup.get('PinCode').patchValue('');
      this.vendorRegistrationFormGroup.get('City').patchValue('');
      this.vendorRegistrationFormGroup.get('State').patchValue('');
      this.vendorRegistrationFormGroup.get('AddressLine1').patchValue('');
      this.vendorRegistrationFormGroup.get('AddressLine2').patchValue('');
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
  GetLocationByPincode(event): void {
    const Pincode = event.target.value;
    if (Pincode) {
      this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const loc = data as CBPLocation;
          if (loc) {
            this.vendorRegistrationFormGroup.get('City').patchValue(loc.District);
            this.vendorRegistrationFormGroup.get('State').patchValue(loc.State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(loc.Country);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  DisplayPhone2(): void {
    // this.vendorRegistrationFormGroup.get('Phone2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.vendorRegistrationFormGroup.get('Phone2').updateValueAndValidity();
    this.IsDisplayPhone2 = true;
  }

  DisplayEmail2(): void {
    this.vendorRegistrationFormGroup.get('Email2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.vendorRegistrationFormGroup.get('Email2').updateValueAndValidity();
    this.IsDisplayEmail2 = true;
  }

  GetRegisteredVendorOnBoardings(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetRegisteredVendorOnBoardings().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
        if (this.AllVendorOnBoardings && this.AllVendorOnBoardings.length) {
          this.loadSelectedBPVendorOnBoarding(this.AllVendorOnBoardings[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedBPVendorOnBoarding(selectedBPVendorOnBoarding: BPVendorOnBoarding): void {
    this.ResetControl();
    this.SelectedBPVendorOnBoarding = selectedBPVendorOnBoarding;
    this.selectID = selectedBPVendorOnBoarding.TransID;
    // this.EnableAllVendorOnBoardingTypes();
    this.SetBPVendorOnBoardingValues();
    this.GetBPVendorOnBoardingSubItems();
  }

  typeSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      this.SelectedBPVendorOnBoarding.Type = event.value;
    }
  }

  applyFilter(filterValue: string): void {
    this.identificationDataSource.filter = filterValue.trim().toLowerCase();
  }

  // EnableAllVendorOnBoardingTypes(): void {
  //   Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
  //     this.vendorRegistrationFormGroup.get(key).enable();
  //   });
  // }

  SetBPVendorOnBoardingValues(): void {
    console.log('SelectedBPVendorOnBoarding',this.SelectedBPVendorOnBoarding);
    this.vendorRegistrationFormGroup.get('Name').patchValue(this.SelectedBPVendorOnBoarding.Name);
    this.vendorRegistrationFormGroup.get('Type').patchValue(this.SelectedBPVendorOnBoarding.Type);
    this.vendorRegistrationFormGroup.get('Role').patchValue(this.SelectedBPVendorOnBoarding.Role);
    this.vendorRegistrationFormGroup.get('GST').patchValue(this.SelectedBPVendorOnBoarding.GSTNumber);
    this.vendorRegistrationFormGroup.get('PAN').patchValue(this.SelectedBPVendorOnBoarding.PANNumber);
    this.vendorRegistrationFormGroup.get('LegalName').patchValue(this.SelectedBPVendorOnBoarding.LegalName);
    this.vendorRegistrationFormGroup.get('AddressLine1').patchValue(this.SelectedBPVendorOnBoarding.AddressLine1);
    this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(this.SelectedBPVendorOnBoarding.AddressLine2);
    this.vendorRegistrationFormGroup.get('PinCode').patchValue(this.SelectedBPVendorOnBoarding.PinCode);
    this.vendorRegistrationFormGroup.get('City').patchValue(this.SelectedBPVendorOnBoarding.City);
    this.vendorRegistrationFormGroup.get('State').patchValue(this.SelectedBPVendorOnBoarding.State);
    this.vendorRegistrationFormGroup.get('Country').patchValue(this.SelectedBPVendorOnBoarding.Country);
    this.vendorRegistrationFormGroup.get('Phone1').patchValue(this.SelectedBPVendorOnBoarding.Phone1);
    this.vendorRegistrationFormGroup.get('Phone2').patchValue(this.SelectedBPVendorOnBoarding.Phone2);
    this.vendorRegistrationFormGroup.get('Email1').patchValue(this.SelectedBPVendorOnBoarding.Email1);
    this.vendorRegistrationFormGroup.get('Email2').patchValue(this.SelectedBPVendorOnBoarding.Email2);
    
    let MSMEType=this.SelectedBPVendorOnBoarding.MSME_TYPE;
    if (MSMEType ==="MIC") {
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Micro Enterprise");
    } else if (MSMEType ===  "SML") {
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Small Enterprise");
    } else if (MSMEType ==="MID") {
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Medium Enterprise");
    } else if (MSMEType === "MSME") {
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Micro,Small & Medium");
    }
    else {
      this.vendorRegistrationFormGroup.get('MSMEType').patchValue("Not Applicable");
    }
    // this.vendorRegistrationFormGroup.get('MSMEType').patchValue(this.SelectedBPVendorOnBoarding.MSME_TYPE);

    this.vendorRegistrationFormGroup.get('TypeOfIndustry').patchValue(this.BPVendorOnBoarding.TypeofIndustry);
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

  AddIdentificationToTable(): void {
    if (this.identificationFormGroup.valid) {
      const bPIdentity = new BPIdentity();
      bPIdentity.Type = this.identificationFormGroup.get('Type').value;
      bPIdentity.IDNumber = this.identificationFormGroup.get('IDNumber').value;
      bPIdentity.ValidUntil = this.identificationFormGroup.get('ValidUntil').value;
      if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length) {
        this.IdentificationsByVOB = [];
      }
      this.IdentificationsByVOB.push(bPIdentity);
      this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
      this.ClearIdentificationFormGroup();
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

  onKey(event): void {
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
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

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
          if (Actiontype === 'Approve') {
            this.ApproveVendor();
          } else if (Actiontype === 'Reject') {
            this.RejectVendor();
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
    // this.GetBPActivityLogValues();
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

  CreateVendorOnBoarding(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    // this.SelectedBPVendorOnBoardingView.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.CreateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        this.SelectedBPVendorOnBoarding.TransID = +data;
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor registered successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredVendorOnBoardings();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateVendorOnBoarding(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    this.SelectedBPVendorOnBoardingView.TransID = this.SelectedBPVendorOnBoarding.TransID;
    // this.SelectedBPVendorOnBoardingView.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.UpdateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor registration updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredVendorOnBoardings();
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
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredVendorOnBoardings();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ApproveVendor(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.SelectedBPVendorOnBoarding.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.ApproveVendor(this.SelectedBPVendorOnBoarding).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor approved successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetVendorOnBoardingsByID();
        this._router.navigate(['/pages/dashboard']);
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  RejectVendor(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.SelectedBPVendorOnBoarding.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.RejectVendor(this.SelectedBPVendorOnBoarding).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor rejected successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetVendorOnBoardingsByID();
        this._router.navigate(['/pages/dashboard']);
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

  ApproveClicked(): void {
    if (this.vendorRegistrationFormGroup.valid) {
      this.GetBPVendorOnBoardingValues();
      this.GetBPVendorOnBoardingSubItemValues();
      this.SetActionToOpenConfirmation('Approve');
    } else {
      this.ShowValidationErrors(this.vendorRegistrationFormGroup);
    }
  }

  RejectClicked(): void {
    if (this.vendorRegistrationFormGroup.valid) {
      this.GetBPVendorOnBoardingValues();
      this.GetBPVendorOnBoardingSubItemValues();
      this.SetActionToOpenConfirmation('Reject');
    } else {
      this.ShowValidationErrors(this.vendorRegistrationFormGroup);
    }
  }

  SetActionToOpenConfirmation(actiontype: string): void {
    if (this.SelectedBPVendorOnBoarding.TransID) {
      const Actiontype = actiontype;
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

  handleFileBPIdentity(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
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
  GetIdentAttachment(element: BPIdentity): void {
    const fileName = element.AttachmentName;
    const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
        saveAs(blob,fileName);
      // this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.GetIdentityAttachment(element.Type, element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' : 
                  fileName.toLowerCase().includes('.pdf') ? 'application/pdf' :  '';
            const blob = new Blob([data], { type: fileType });
            saveAs(blob,fileName);
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
      saveAs(blob,fileName);
      // this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.DowloandAttachmentByIDAndName( element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                  fileName.toLowerCase().includes('.pdf') ? 'application/pdf' :  '';
            const blob = new Blob([data], { type: fileType });
            saveAs(blob,fileName);

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
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^\\d{6,10}$')]);
            }
            else {
              this.vendorRegistrationFormGroup.get(key).clearValidators();
            }
            this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
          }

        }
      }
    });
  }
}
