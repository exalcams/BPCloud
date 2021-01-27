import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuApp, AuthenticationDetails, VendorUser, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { BPVendorOnBoarding, BPVendorOnBoardingView, BPIdentity, BPBank, BPContact, BPActivityLog, QuestionnaireResultSet, Question, QAnswerChoice, Answers, QuestionAnswersView, AnswerList } from 'app/models/vendor-registration';
import { MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CBPLocation, CBPIdentity, CBPBank, StateDetails, CBPFieldMaster, TaxPayerDetails } from 'app/models/vendor-master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Guid } from 'guid-typescript';
import { AttachmentDetails } from 'app/models/attachment';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { SelectGstinDialogComponent } from '../select-gstin-dialog/select-gstin-dialog.component';
import { PhoneDilaogComponent } from '../phone-dilaog/phone-dilaog.component';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  CurrentUserRole = '';
  hiddenoption: boolean = false;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsDisplayPhone2: boolean;
  IsDisplayEmail2: boolean;
  vendorRegistrationFormGroup: FormGroup;
  identificationFormGroup: FormGroup;
  bankDetailsFormGroup: FormGroup;
  contactFormGroup: FormGroup;
  activityLogFormGroup: FormGroup;
  questionFormGroup: FormGroup;
  questionsFormArray = this._formBuilder.array([]);
  searchText = '';
  AllVendorOnBoardings: BPVendorOnBoarding[] = [];
  BPVendorOnBoarding: BPVendorOnBoarding;
  selectID: number;
  SelectedBPVendorOnBoarding: BPVendorOnBoarding;
  SelectedBPVendorOnBoardingView: BPVendorOnBoardingView;
  IdentificationsByVOB: BPIdentity[] = [];
  BanksByVOB: BPBank[] = [];
  ContactsByVOB: BPContact[] = [];
  ActivityLogsByVOB: BPActivityLog[] = [];
  identificationDisplayedColumns: string[] = [
    'firstcolumn',
    'Type',
    'Option',
    'IDNumber',
    'ValidUntil',
    'Attachment',
    'Action'
  ];
  bankDetailsDisplayedColumns: string[] = [
    'firstcolumn',
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
  AllTypes: any[] = [];
  AllCountries: any[] = [];
  lanline: any[] = []
  AllOption: any[] = [];
  myControl = new FormControl();
  myControl1 = new FormControl();
  myControl2 = new FormControl();
  filteredOptions: Observable<any[]>;
  AllStates: StateDetails[] = [];
  statecontrol = new FormControl();
  filteredstate: Observable<StateDetails[]>;

  StateCode: string;
  TaxPayerDetails: TaxPayerDetails;
  selectedCountry: string;
  Country: string;
  math = Math;
  AllQuestionnaireResultSet: QuestionnaireResultSet = new QuestionnaireResultSet();
  AllQuestionAnswersView: QuestionAnswersView[] = [];
  AllQuestions: Question[] = [];
  answerList: AnswerList;
  SelectedQRID: number;
  AllQuestionAnswerChoices: QAnswerChoice[] = [];
  AllQuestionAnswers: Answers[] = [];
  QuestionID: any;
  isDisabledDate: boolean = false;
  AllOnBoardingFieldMaster: CBPFieldMaster[] = [];
  index: number;

  inputvalue = '';
  codeselected = '';
  emailvalue = '';
  Phone1_ng: any;
  Phone2_ng: any;
  titlevalue = '';
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
  pincode: any[] = [];
  count1: any = 0;
  country_india: any;
  country_india_lower: any;
  bankChangeIndex: any = null;
  contactDetailsIndex: any = null;
  activityIndex: any = null;
  addressline1: any[];
  Postaldata: boolean;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _vendorRegistrationService: VendorRegistrationService,
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
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
    // this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    this.IdentityValidity = false;
    this.Status = '';
    this.AllRoles = ['Vendor', 'Customer'];
    // this.AllTypes = ['Manufacturer', 'Service Provider', 'Tranporter', 'Others'];
    // this.AllTypes = ['Domestic supply', 'Domestic Service', 'Import vendor', 'Others'];
    this.AllTypes = [
      { Key: 'Domestic supply', Value: '1' },
      { Key: 'Domestic Service', Value: '2' },
      { Key: 'Import', Value: '3' },
    ];
    // this.AllIdentityTypes = ['GSTIN'];
    this.AllIdentityTypes = [
      { Key: 'GSTIN', Value: '1' },
      { Key: 'Lease based/Rental', Value: '2' },
      { Key: 'TDS Applicable', Value: '3' },
      { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
      { Key: 'MSME Registered', Value: '5' },
      { Key: 'Annual Revenue', Value: '6' },
      { Key: 'Employee Strength', Value: '7' },
      { Key: 'Legal Structure / Form of Business', Value: '8' }];
    // this.AllCountries = ['India'];
    this.AllCountries = [
      { name: 'Afghanistan', code: 'AF', countycode: '+93' },
      { name: 'Åland Islands', code: 'AX', countycode: '+358' },
      { name: 'Albania', code: 'AL', countycode: '+355' },
      { name: 'Algeria', code: 'DZ', countycode: '+213' },
      { name: 'American Samoa', code: 'AS', countycode: '+1-684' },
      { name: 'AndorrA', code: 'AD', countycode: '+376' },
      { name: 'Angola', code: 'AO', countycode: '+344' },
      { name: 'Anguilla', code: 'AI', countycode: '+1-264' },
      { name: 'Antarctica', code: 'AQ', countycode: '+672' },
      { name: 'Antigua and Barbuda', code: 'AG', countycode: '+1-268' },
      { name: 'Argentina', code: 'AR', countycode: '+54' },
      { name: 'Armenia', code: 'AM', countycode: '+374' },
      { name: 'Aruba', code: 'AW', countycode: '+297' },
      { name: 'Australia', code: 'AU', countycode: '+61' },
      { name: 'Austria', code: 'AT', countycode: '+43' },
      { name: 'Azerbaijan', code: 'AZ', countycode: '+994' },
      { name: 'Bahamas', code: 'BS', countycode: '+1-242' },
      { name: 'Bahrain', code: 'BH', countycode: '+973' },
      { name: 'Bangladesh', code: 'BD', countycode: '+880' },
      { name: 'Barbados', code: 'BB', countycode: '+1-246' },
      { name: 'Belarus', code: 'BY', countycode: '+375' },
      { name: 'Belgium', code: 'BE', countycode: '+32' },
      { name: 'Belize', code: 'BZ', countycode: '+501' },
      { name: 'Benin', code: 'BJ', countycode: '+229' },
      { name: 'Bermuda', code: 'BM', countycode: '+1-441' },
      { name: 'Bhutan', code: 'BT', countycode: '+975' },
      { name: 'Bolivia', code: 'BO', countycode: '+591' },
      { name: 'Bosnia and Herzegovina', code: 'BA', countycode: '+387' },
      { name: 'Botswana', code: 'BW', countycode: '+267' },
      { name: 'Bouvet Island', code: 'BV', countycode: '+3166-2' },
      { name: 'Brazil', code: 'BR', countycode: '+55' },
      { name: 'British Indian Ocean Territory', code: 'IO', countycode: '+246' },
      { name: 'Brunei Darussalam', code: 'BN', countycode: '+673' },
      { name: 'Bulgaria', code: 'BG', countycode: '+359' },
      { name: 'Burkina Faso', code: 'BF', countycode: '+226' },
      { name: 'Burundi', code: 'BI', countycode: '+257' },
      { name: 'Cambodia', code: 'KH', countycode: '+855' },
      { name: 'Cameroon', code: 'CM', countycode: '+237' },
      { name: 'Canada', code: 'CA', countycode: '+1' },
      { name: 'Cape Verde', code: 'CV', countycode: '+238' },
      { name: 'Cayman Islands', code: 'KY', countycode: '+1-345' },
      { name: 'Central African Republic', code: 'CF', countycode: '+236' },
      { name: 'Chad', code: 'TD', countycode: '+235' },
      { name: 'Chile', code: 'CL', countycode: '+56' },
      { name: 'China', code: 'CN', countycode: '+86' },
      { name: 'Christmas Island', code: 'CX', countycode: '+61' },
      { name: 'Cocos (Keeling) Islands', code: 'CC', countycode: '+61' },
      { name: 'Colombia', code: 'CO', countycode: '+57' },
      { name: 'Comoros', code: 'KM', countycode: '+269' },
      { name: 'Congo', code: 'CG', countycode: '+242' },
      { name: 'Congo, The Democratic Republic of the', code: 'CD', countycode: '+243' },
      { name: 'Cook Islands', code: 'CK', countycode: '+682' },
      { name: 'Costa Rica', code: 'CR', countycode: '+506' },
      { name: 'Cote D\'Ivoire', code: 'CI', countycode: '+225' },
      { name: 'Croatia', code: 'HR', countycode: '+385' },
      { name: 'Cuba', code: 'CU', countycode: '+53' },
      { name: 'Cyprus', code: 'CY', countycode: '+357' },
      { name: 'Czech Republic', code: 'CZ', countycode: '+420' },
      { name: 'Denmark', code: 'DK', countycode: '+45' },
      { name: 'Djibouti', code: 'DJ', countycode: '+253' },
      { name: 'Dominica', code: 'DM', countycode: '+1-767' },
      { name: 'Dominican Republic', code: 'DO', countycode: '+1-809' },
      { name: 'Ecuador', code: 'EC', countycode: '+593' },
      { name: 'Egypt', code: 'EG', countycode: '+20' },
      { name: 'El Salvador', code: 'SV', countycode: '+503' },
      { name: 'Equatorial Guinea', code: 'GQ', countycode: '+240' },
      { name: 'Eritrea', code: 'ER', countycode: '+291' },
      { name: 'Estonia', code: 'EE', countycode: '+372' },
      { name: 'Ethiopia', code: 'ET', countycode: '+251' },
      { name: 'Falkland Islands (Malvinas)', code: 'FK', countycode: '+500' },
      { name: 'Faroe Islands', code: 'FO', countycode: '+298' },
      { name: 'Fiji', code: 'FJ', countycode: '+679' },
      { name: 'Finland', code: 'FI', countycode: '+358' },
      { name: 'France', code: 'FR', countycode: '+33' },
      { name: 'French Guiana', code: 'GF', countycode: '+594' },
      { name: 'French Polynesia', code: 'PF', countycode: '+689' },
      { name: 'French Southern Territories', code: 'TF', countycode: '+262' },
      { name: 'Gabon', code: 'GA', countycode: '+241' },
      { name: 'Gambia', code: 'GM', countycode: '+220' },
      { name: 'Georgia', code: 'GE', countycode: '+995' },
      { name: 'Germany', code: 'DE', countycode: '+49' },
      { name: 'Ghana', code: 'GH', countycode: '+233' },
      { name: 'Gibraltar', code: 'GI', countycode: '+350' },
      { name: 'Greece', code: 'GR', countycode: '+30' },
      { name: 'Greenland', code: 'GL', countycode: '+299' },
      { name: 'Grenada', code: 'GD', countycode: '+1-473' },
      { name: 'Guadeloupe', code: 'GP', countycode: '+590' },
      { name: 'Guam', code: 'GU', countycode: '+1-671' },
      { name: 'Guatemala', code: 'GT', countycode: '+502' },
      { name: 'Guernsey', code: 'GG', countycode: '+44-1481' },
      { name: 'Guinea', code: 'GN', countycode: '+224' },
      { name: 'Guinea-Bissau', code: 'GW', countycode: '+245' },
      { name: 'Guyana', code: 'GY', countycode: '+592' },
      { name: 'Haiti', code: 'HT', countycode: '+509' },
      { name: 'Heard Island and Mcdonald Islands', code: 'HM', countycode: '+672' },
      { name: 'Holy See (Vatican City State)', code: 'VA', countycode: '+379' },
      { name: 'Honduras', code: 'HN', countycode: '+504' },
      { name: 'Hong Kong', code: 'HK', countycode: '+852' },
      { name: 'Hungary', code: 'HU', countycode: '+36' },
      { name: 'Iceland', code: 'IS', countycode: '+354' },
      { name: 'India', code: 'IN', countrycode: '+91' },
      { name: 'Indonesia', code: 'ID', countycode: '+62' },
      { name: 'Iran, Islamic Republic Of', code: 'IR', countycode: '+98' },
      { name: 'Iraq', code: 'IQ', countycode: '+964' },
      { name: 'Ireland', code: 'IE', countycode: '+353' },
      { name: 'Isle of Man', code: 'IM', countycode: '+44-1624' },
      { name: 'Israel', code: 'IL', countycode: '+972' },
      { name: 'Italy', code: 'IT', countycode: '+39' },
      { name: 'Jamaica', code: 'JM', countycode: '+1-876' },
      { name: 'Japan', code: 'JP', countycode: '+81' },
      { name: 'Jersey', code: 'JE', countycode: '+44-1534' },
      { name: 'Jordan', code: 'JO', countycode: '+962' },
      { name: 'Kazakhstan', code: 'KZ', countycode: '+7' },
      { name: 'Kenya', code: 'KE', countycode: '+254' },
      { name: 'Kiribati', code: 'KI', countycode: '+686' },
      { name: 'Korea, Democratic People\'S Republic of', code: 'KP', countycode: '+850' },
      { name: 'Korea, Republic of', code: 'KR', countycode: '+82' },
      { name: 'Kuwait', code: 'KW', countycode: '+965' },
      { name: 'Kyrgyzstan', code: 'KG', countycode: '+996' },
      { name: 'Lao People\'S Democratic Republic', code: 'LA', countycode: '+856' },
      { name: 'Latvia', code: 'LV', countycode: '+371' },
      { name: 'Lebanon', code: 'LB', countycode: '+961' },
      { name: 'Lesotho', code: 'LS', countycode: '+266' },
      { name: 'Liberia', code: 'LR', countycode: '+231' },
      { name: 'Libyan Arab Jamahiriya', code: 'LY', countycode: '+218' },
      { name: 'Liechtenstein', code: 'LI', countycode: '+423' },
      { name: 'Lithuania', code: 'LT', countycode: '+370' },
      { name: 'Luxembourg', code: 'LU', countycode: '+352' },
      { name: 'Macao', code: 'MO', countycode: '+853' },
      { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK', countycode: '+389' },
      { name: 'Madagascar', code: 'MG', countycode: '+261' },
      { name: 'Malawi', code: 'MW', countycode: '+265' },
      { name: 'Malaysia', code: 'MY', countycode: '+60' },
      { name: 'Maldives', code: 'MV', countycode: '+960' },
      { name: 'Mali', code: 'ML', countycode: '+223' },
      { name: 'Malta', code: 'MT', countycode: '+356' },
      { name: 'Marshall Islands', code: 'MH', countycode: '+692' },
      { name: 'Martinique', code: 'MQ', countycode: '+596' },
      { name: 'Mauritania', code: 'MR', countycode: '+222' },
      { name: 'Mauritius', code: 'MU', countycode: '+230' },
      { name: 'Mayotte', code: 'YT', countycode: '+262' },
      { name: 'Mexico', code: 'MX', countycode: '+52' },
      { name: 'Micronesia, Federated States of', code: 'FM', countycode: '+691' },
      { name: 'Moldova, Republic of', code: 'MD', countycode: '+373' },
      { name: 'Monaco', code: 'MC', countycode: '+377' },
      { name: 'Mongolia', code: 'MN', countycode: '+976' },
      { name: 'Montserrat', code: 'MS', countycode: '+1-664' },
      { name: 'Morocco', code: 'MA', countycode: '+212' },
      { name: 'Mozambique', code: 'MZ', countycode: '+258' },
      { name: 'Myanmar', code: 'MM', countycode: '+95' },
      { name: 'Namibia', code: 'NA', countycode: '+264' },
      { name: 'Nauru', code: 'NR', countycode: '+674' },
      { name: 'Nepal', code: 'NP', countycode: '+977' },
      { name: 'Netherlands', code: 'NL', countycode: '+31' },
      { name: 'Netherlands Antilles', code: 'AN', countycode: '+599' },
      { name: 'New Caledonia', code: 'NC', countycode: '+687' },
      { name: 'New Zealand', code: 'NZ', countycode: '+64' },
      { name: 'Nicaragua', code: 'NI', countycode: '+505' },
      { name: 'Niger', code: 'NE', countycode: '+227' },
      { name: 'Nigeria', code: 'NG', countycode: '+234' },
      { name: 'Niue', code: 'NU', countycode: '+683' },
      { name: 'Norfolk Island', code: 'NF', countycode: '+672' },
      { name: 'Northern Mariana Islands', code: 'MP', countycode: '+1' },
      { name: 'Norway', code: 'NO', countycode: '+47' },
      { name: 'Oman', code: 'OM', countycode: '+968' },
      { name: 'Pakistan', code: 'PK', countycode: '+92' },
      { name: 'Palau', code: 'PW', countycode: '+680' },
      { name: 'Palestinian Territory, Occupied', code: 'PS', countycode: '+970' },
      { name: 'Panama', code: 'PA', countycode: '+507' },
      { name: 'Papua New Guinea', code: 'PG', countycode: '+675' },
      { name: 'Paraguay', code: 'PY', countycode: '+595' },
      { name: 'Peru', code: 'PE', countycode: '+51' },
      { name: 'Philippines', code: 'PH', countycode: '+63' },
      { name: 'Pitcairn', code: 'PN', countycode: '+64' },
      { name: 'Poland', code: 'PL', countycode: '+48' },
      { name: 'Portugal', code: 'PT', countycode: '+351' },
      { name: 'Puerto Rico', code: 'PR', countycode: '+1-787' },
      { name: 'Qatar', code: 'QA', countycode: '+974' },
      { name: 'Reunion', code: 'RE', countycode: '+262' },
      { name: 'Romania', code: 'RO', countycode: '+40' },
      { name: 'Russian Federation', code: 'RU', countycode: '+7' },
      { name: 'RWANDA', code: 'RW', countycode: '+250' },
      { name: 'Saint Helena', code: 'SH', countycode: '+590' },
      { name: 'Saint Kitts and Nevis', code: 'KN', countycode: '+1-869' },
      { name: 'Saint Lucia', code: 'LC', countycode: '+1-758' },
      { name: 'Saint Pierre and Miquelon', code: 'PM', countycode: '+508' },
      { name: 'Saint Vincent and the Grenadines', code: 'VC', countycode: '+1-784' },
      { name: 'Samoa', code: 'WS', countycode: '+685' },
      { name: 'San Marino', code: 'SM', countycode: '+378' },
      { name: 'Sao Tome and Principe', code: 'ST', countycode: '+239' },
      { name: 'Saudi Arabia', code: 'SA', countycode: '+966' },
      { name: 'Senegal', code: 'SN', countycode: '+221' },
      { name: 'Serbia and Montenegro', code: 'CS', countycode: '+381' },
      { name: 'Seychelles', code: 'SC', countycode: '+248' },
      { name: 'Sierra Leone', code: 'SL', countycode: '+232' },
      { name: 'Singapore', code: 'SG', countycode: '+65' },
      { name: 'Slovakia', code: 'SK', countycode: '+421' },
      { name: 'Slovenia', code: 'SI', countycode: '+386' },
      { name: 'Solomon Islands', code: 'SB', countycode: '+677' },
      { name: 'Somalia', code: 'SO', countycode: '+252' },
      { name: 'South Africa', code: 'ZA', countycode: '+27' },
      { name: 'South Georgia and the South Sandwich Islands', code: 'GS', countycode: '+500' },
      { name: 'Spain', code: 'ES', countycode: '+34' },
      { name: 'Sri Lanka', code: 'LK', countycode: '+94' },
      { name: 'Sudan', code: 'SD', countycode: '+249' },
      { name: 'Suriname', code: 'SR', countycode: '+597' },
      { name: 'Svalbard and Jan Mayen', code: 'SJ', countycode: '+47' },
      { name: 'Swaziland', code: 'SZ', countycode: '+268' },
      { name: 'Sweden', code: 'SE', countycode: '+46' },
      { name: 'Switzerland', code: 'CH', countycode: '+41' },
      { name: 'Syrian Arab Republic', code: 'SY', countycode: '+963' },
      { name: 'Taiwan, Province of China', code: 'TW' },


      { name: 'Taiwan, Province of China', code: 'TW', countycode: '+886' },
      { name: 'Tajikistan', code: 'TJ', countycode: '+992' },
      { name: 'Tanzania, United Republic of', code: 'TZ', countycode: '+255' },
      { name: 'Thailand', code: 'TH', countycode: '+66' },
      { name: 'Timor-Leste', code: 'TL', countycode: '+670' },
      { name: 'Togo', code: 'TG', countycode: '+228' },
      { name: 'Tokelau', code: 'TK', countycode: '+690' },
      { name: 'Tonga', code: 'TO', countycode: '+676' },
      { name: 'Trinidad and Tobago', code: 'TT', countycode: '+1-868' },
      { name: 'Tunisia', code: 'TN', countycode: '+216' },
      { name: 'Turkey', code: 'TR', countycode: '+90' },
      { name: 'Turkmenistan', code: 'TM', countycode: '+993' },
      { name: 'Turks and Caicos Islands', code: 'TC', countycode: '+1-649' },
      { name: 'Tuvalu', code: 'TV', countycode: '+688' },
      { name: 'Uganda', code: 'UG', countycode: '+256' },
      { name: 'Ukraine', code: 'UA', countycode: '+380' },
      { name: 'United Arab Emirates', code: 'AE', countycode: '+971' },
      { name: 'United Kingdom', code: 'GB', countycode: '+44' },
      { name: 'United States', code: 'US', countycode: '+1' },
      { name: 'United States Minor Outlying Islands', code: 'UM', countycode: '+246' },
      { name: 'Uruguay', code: 'UY', countycode: '+598' },
      { name: 'Uzbekistan', code: 'UZ', countycode: '+998' },
      { name: 'Vanuatu', code: 'VU', countycode: '+678' },
      { name: 'Venezuela', code: 'VE', countycode: '+58' },
      { name: 'Viet Nam', code: 'VN', countycode: '+84' },
      { name: 'Virgin Islands, British', code: 'VG', countycode: '+1' },
      { name: 'Virgin Islands, U.S.', code: 'VI', countycode: '+1' },
      { name: 'Wallis and Futuna', code: 'WF', countycode: '+681' },
      { name: 'Western Sahara', code: 'EH', countycode: '+212' },
      { name: 'Yemen', code: 'YE', countycode: '+967' },
      { name: 'Zambia', code: 'ZM', countycode: '+260' },
      { name: 'Zimbabwe', code: 'ZW', countycode: '+263' }
    ];
    // this.selectedCountry = this.AllCountries[0];
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
    this.Status = '';
    this.StateCode = '';
    this.answerList = new AnswerList();
    this.SelectedIdentity = new BPIdentity();
    this.SelectedBank = new BPBank();
    this.AllOption = [
      'Micro',
      'Small',
      'Large'
    ]
  }

  ngOnInit(): void {

    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('Company Details') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.InitializeVendorRegistrationFormGroup();
      this.InitializeIdentificationFormGroup();
      this.InitializeBankDetailsFormGroup();
      this.InitializeContactFormGroup();
      this.InitializeQuestionsFormGroup();
      // this.InitializeBankDetailsTable();
      this.GetVendorOnBoardingsByEmailID();
      this.GetAllOnBoardingFieldMaster();
      this.GetAllIdentities();
      this.GetAllIdentityTypes();
      this.GetStateDetails();
      // this.GetQuestionAnswers();
      this.InitializeActivityLogFormGroup();
      // this.GetRegisteredVendorOnBoardings();
      this.filteredOptions = this.myControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );

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
      this.lanline = [
        { num: '04634' },
        { num: '04253' },
        { num: '04153' },
        { num: '04371' },
        { num: '04320' },
        { num: '04329' },
        { num: '04177' },
        { num: '04173' },
        { num: '04566' },
        { num: '04282' },
        { num: '04296' },
        { num: '04543' },
        { num: '04256' },
        { num: '04188' },
        { num: '044' },
        { num: '04144' },
        { num: '0422' },
        { num: '04142' },
        { num: '04554' },
        { num: '04347' },
        { num: '04561' },
        { num: '04258' },
        { num: '04342' },
        { num: '0451' },
        { num: '0424' },
        { num: '04145' },
        { num: '04285' },
        { num: '04262' },
        { num: '04171' },
        { num: '04346' },
        { num: '04344' },
        { num: '04331' },
        { num: '04151' },
        { num: '04257' },
        { num: '04368' },
        { num: '04565' },
        { num: '04324' },
        { num: '04339' },
        { num: '04542' },
        { num: '04204' },
        { num: '04266' },
        { num: '04632' },
        { num: '04323' },
        { num: '0435' },
        { num: '04651' },
        { num: '0452' },
        { num: '04574' },
        { num: '04332' },
        { num: '04367' },
        { num: '04364' },
        { num: '04254' },
        { num: '04298' },
        { num: '04576' },
        { num: '04202' },
        { num: '04326' },
        { num: '04365' },
        { num: '04652' },
        { num: '04286' },
        { num: '04635' },
        { num: '04544' },
        { num: '04553' },
        { num: '04290' },
        { num: '0423' },
        { num: '04372' },
        { num: '04348' },
        { num: '04545' },
        { num: '04255' },
        { num: '04374' },
        { num: '04564' },
        { num: '04373' },
        { num: '04328' },
        { num: '04294' },
        { num: '04259' },
        { num: '04181' },
        { num: '0413' },
        { num: '04333' },
        { num: '04322' },
        { num: '04563' },
        { num: '04567' },
        { num: '04573' },
        { num: '04172' },
        { num: '04287' },
        { num: '0427' },
        { num: '04283' },
        { num: '04636' },
        { num: '04295' },
        { num: '04575' },
        { num: '04630' },
        { num: '04633' },
        { num: '04362' },
        { num: '04546' },
        { num: '04549' },
        { num: '04369' },
        { num: '04327' },
        { num: '04147' },
        { num: '04369' },
        { num: '04288' },
        { num: '0462' },
        { num: '04577' },
        { num: '04179' },
        { num: '0421' },
        { num: '04175' },
        { num: '04366' },
        { num: '04182' },
        { num: '0431' },
        { num: '0461' },
        { num: '04252' },
        { num: '04149' },
        { num: '04552' },
        { num: '04341' },
        { num: '04292' },
        { num: '04367' },
        { num: '04174' },
        { num: '04551' },
        { num: '0416' },
        { num: '04268' },
        { num: '04638' },
        { num: '04146' },
        { num: '04143' },
        { num: '04562' },
        { num: '04183' },
        { num: '04281' },
      ],
        this.pincode = [
          { num: '403004' },
          { num: '638115' },
          { num: '797115' },
          { num: '744204' },
          { num: '799005' },
          { num: '523201' },
          { num: '504001' },
          { num: '518301' },
          { num: '691523' },
          { num: '799001' },
          { num: '282003' },
          { num: '380001' },
          { num: '414001' },
          { num: '796190' },
          { num: '796001' },
          { num: '305001' },
          { num: '224122' },
          { num: '444001' },
          { num: '798619' },
          { num: '678541' },
          { num: '403508' },
          { num: '402201' },
          { num: '202001' },
          { num: '700027' },
          { num: '520008' },
          { num: '518543' },
          { num: '211001' },
          { num: '211003' },
          { num: '211002' },
          { num: '688001' },
          { num: '263601' },
          { num: '791001' },
          { num: '683101' },
          { num: '301001' },
          { num: '532185' },
          { num: '533201' },
          { num: '444601' },
          { num: '799101' },
          { num: '133001' },
          { num: '133003' },
          { num: '682302' },
          { num: '799289' },
          { num: '627401' },
          { num: '600053' },
          { num: '497001' },
          { num: '682552' },
          { num: '794115' },
          { num: '799108' },
          { num: '364601' },
          { num: '143001' },
          { num: '244221' },
          { num: '531001' },
          { num: '388001' },
          { num: '799157' },
          { num: '515001' },
          { num: '192101' },
          { num: '682551' },
          { num: '759122' },
          { num: '792101' },
          { num: '600002' },
          { num: '631001' },
          { num: '712601' },
          { num: '625061' },
          { num: '503224' },
          { num: '632601' },
          { num: '802301' },
          { num: '573103' },
          { num: '799003' },
          { num: '626101' },
          { num: '713301' },
          { num: '682510' },
          { num: '761110' },
          { num: '793011' },
          { num: '754029' },
          { num: '591304' },
          { num: '534134' },
          { num: '695101' },
          { num: '636102' },
          { num: '206122' },
          { num: '431001' },
          { num: '824101' },
          { num: '600054' },
          { num: '521121' },
          { num: '276001' },
          { num: '799206' },
          { num: '793002' },
          { num: '793103' },
          { num: '587101' },
          { num: '799119' },
          { num: '794102' },
          { num: '125417' },
          { num: '271801' },
          { num: '301701' },
          { num: '814112' },
          { num: '591102' },
          { num: '744208' },
          { num: '481001' },
          { num: '767001' },
          { num: '793106' },
          { num: '756001' },
          { num: '277001' },
          { num: '271201' },
          { num: '733101' },
          { num: '210001' },
          { num: '560002' },
          { num: '560001' },
          { num: '813102' },
          { num: '722101' },
          { num: '272153' },
          { num: '327001' },
          { num: '522101' },
          { num: '225001' },
          { num: '700001' },
          { num: '193101' },
          { num: '743201' },
          { num: '250611' },
          { num: '794103' },
          { num: '243001' },
          { num: '768028' },
          { num: '757001' },
          { num: '344001' },
          { num: '793101' },
          { num: '743101' },
          { num: '174305' },
          { num: '743302' },
          { num: '560004' },
          { num: '743411' },
          { num: '272001' },
          { num: '151001' },
          { num: '321401' },
          { num: '305901' },
          { num: '431122' },
          { num: '851101' },
          { num: '700010' },
          { num: '590001' },
          { num: '700056' },
          { num: '583101' },
          { num: '760001' },
          { num: '742101' },
          { num: '845838' },
          { num: '460001' },
          { num: '403603' },
          { num: '507111' },
          { num: '756110' },
          { num: '577301' },
          { num: '812001' },
          { num: '441904' },
          { num: '761126' },
          { num: '321001' },
          { num: '392001' },
          { num: '841460' },
          { num: '638301' },
          { num: '364001' },
          { num: '766001' },
          { num: '490001' },
          { num: '311001' },
          { num: '534201' },
          { num: '477001' },
          { num: '125021' },
          { num: '508116' },
          { num: '462022' },
          { num: '462003' },
          { num: '462001' },
          { num: '751001' },
          { num: '370001' },
          { num: '425201' },
          { num: '585401' },
          { num: '803101' },
          { num: '586101' },
          { num: '246701' },
          { num: '334001' },
          { num: '495001' },
          { num: '174001' },
          { num: '396321' },
          { num: '795126' },
          { num: '532558' },
          { num: '625513' },
          { num: '827001' },
          { num: '799106' },
          { num: '793107' },
          { num: '799155' },
          { num: '796710' },
          { num: '394601' },
          { num: '798631' },
          { num: '400091' },
          { num: '364710' },
          { num: '520002' },
          { num: '203001' },
          //  {num:'443001'},
          { num: '323001' },
          { num: '713101' },
          { num: '802101' },
          { num: '700001' },
          { num: '744302' },
          { num: '744301' },
          { num: '833201' },
          { num: '797105' },
          { num: '795102' },
          { num: '680307' },
          { num: '424101' },
          { num: '176310' },
          { num: '798603' },
          { num: '796321' },
          { num: '795127' },
          { num: '160017' },
          { num: '796007' },
          { num: '753002' },
          { num: '517101' },
          { num: '442401' },
          { num: '799251' },
          { num: '792120' },
          { num: '571501' },
          { num: '792104' },
          { num: '841301' },
          { num: '799107' },
          { num: '761020' },
          { num: '400071' },
          { num: '603001' },
          { num: '686101' },
          { num: '689121' },
          { num: '793111' },
          { num: '793108' },
          { num: '688524' },
          { num: '480001' },
          { num: '471001' },
          { num: '562101' },
          { num: '577101' },
          { num: '608001' },
          { num: '797102' },
          { num: '403711' },
          { num: '591201' },
          { num: '522616' },
          { num: '400009' },
          { num: '795158' },
          { num: '331001' },
          { num: '638401' },
          { num: '641001' },
          { num: '641005' },
          { num: '721401' },
          { num: '736101' },
          { num: '643101' },
          { num: '700002' },
          { num: '607001' },
          { num: '516001' },
          { num: '753001' },
          { num: '391110' },
          { num: '793109' },
          { num: '400014' },
          { num: '389151' },
          { num: '822101' },
          { num: '470661' },
          { num: '791122' },
          { num: '846004' },
          { num: '524003' },
          { num: '734101' },
          { num: '796111' },
          { num: '144205' },
          { num: '475661' },
          { num: '303301' },
          { num: '577001' },
          { num: '321203' },
          { num: '177101' },
          { num: '248001' },
          { num: '248003' },
          { num: '796751' },
          { num: '786629' },
          { num: '274001' },
          { num: '630302' },
          { num: '455001' },
          { num: '795143' },
          { num: '403504' },
          { num: '246761' },
          { num: '826001' },
          { num: '454001' },
          { num: '799250' },
          { num: '638656' },
          { num: '636701' },
          { num: '516671' },
          { num: '580001' },
          { num: '759001' },
          { num: '387810' },
          { num: '328001' },
          { num: '176215' },
          { num: '783301' },
          { num: '424001' },
          { num: '743331' },
          { num: '786001' },
          { num: '403705' },
          { num: '341301' },
          { num: '744202' },
          { num: '737107' },
          { num: '797112' },
          { num: '624001' },
          { num: '790101' },
          { num: '385535' },
          { num: '794005' },
          { num: '791112' },
          { num: '741101' },
          { num: '814101' },
          { num: '314001' },
          { num: '491001' },
          { num: '713201' },
          { num: '534001' },
          { num: '682011' },
          { num: '638001' },
          { num: '207001' },
          { num: '206001' },
          { num: '224001' },
          { num: '121001' },
          { num: '151203' },
          { num: '209601' },
          { num: '332310' },
          { num: '212601' },
          { num: '152001' },
          { num: '283203' },
          { num: '582101' },
          { num: '509125' },
          { num: '382010' },
          { num: '302015' },
          { num: '180004' },
          { num: '322201' },
          { num: '737101' },
          { num: '737101' },
          { num: '794105' },
          { num: '823001' },
          { num: '400086' },
          { num: '201001' },
          { num: '233001' },
          { num: '40004' },
          { num: '788105' },
          { num: '815301' },
          { num: '389001' },
          { num: '124301' },
          { num: '591307' },
          { num: '271001' },
          { num: '360311' },
          { num: '441601' },
          { num: '841428' },
          { num: '246401' },
          { num: '273001' },
          { num: '521301' },
          { num: '632602' },
          { num: '524101' },
          { num: '788115' },
          { num: '585101' },
          { num: '835207' },
          { num: '473001' },
          { num: '515801' },
          { num: '522001' },
          { num: '143521' },
          { num: '122001' },
          { num: '781001' },
          { num: '781014' },
          { num: '474001' },
          { num: '560008' },
          { num: '844101' },
          { num: '263139' },
          { num: '177001' },
          { num: '210301' },
          { num: '506001' },
          { num: '335512' },
          { num: '793001' },
          { num: '245101' },
          { num: '583131' },
          { num: '241001' },
          { num: '573201' },
          { num: '581110' },
          { num: '792102' },
          { num: '825301' },
          { num: '744211' },
          { num: '791103' },
          { num: '383001' },
          { num: '322230' },
          { num: '515201' },
          { num: '834002' },
          { num: '125001' },
          { num: '461001' },
          { num: '146001' },
          { num: '583201' },
          { num: '711101' },
          { num: '580020' },
          { num: '591309' },
          { num: '505468' },
          { num: '500001' },
          { num: '500002' },
          { num: '416115' },
          { num: '795001' },
          { num: '798619' },
          { num: '586209' },
          { num: '452001' },
          { num: '791002' },
          { num: '680121' },
          { num: '791111' },
          { num: '744209' },
          { num: '799261' },
          { num: '682556' },
          { num: '521333' },
          { num: '799277' },
          { num: '795103' },
          { num: '533001' },
          { num: '682030' },
          { num: '795122' },
          { num: '400002' },
          { num: '790002' },
          { num: '606202' },
          { num: '382721' },
          { num: '682557' },
          { num: '673121' },
          { num: '421301' },
          { num: '799203' },
          { num: '799210' },
          { num: '799285' },
          { num: '503111' },
          { num: '441001' },
          { num: '799288' },
          { num: '799270' },
          { num: '631501' },
          { num: '742137' },
          { num: '403515' },
          { num: '523105' },
          { num: '176001' },
          { num: '673315' },
          { num: '523320' },
          { num: '676121' },
          { num: '686507' },
          { num: '494334' },
          { num: '313324' },
          { num: '670001' },
          { num: '208001' },
          { num: '208004' },
          { num: '403710' },
          { num: '744309' },
          { num: '144601' },
          { num: '415110' },
          { num: '630001' },
          { num: '788710' },
          { num: '505001' },
          { num: '574104' },
          { num: '132001' },
          { num: '795106' },
          { num: '690518' },
          { num: '639001' },
          { num: '581301' },
          { num: '581301' },
          { num: '685508' },
          { num: '713130' },
          { num: '524201' },
          { num: '403410' },
          { num: '690502' },
          { num: '754211' },
          { num: '758001' },
          { num: '5000004' },
          { num: '361305' },
          { num: '444303' },
          { num: '507001' },
          { num: '450001' },
          { num: '141401' },
          { num: '451001' },
          { num: '799008' },
          { num: '387411' },
          { num: '262701' },
          { num: '793200' },
          { num: '796310' },
          { num: '786630' },
          { num: '799201' },
          { num: '752055' },
          { num: '203131' },
          { num: '791121' },
          { num: '798611' },
          { num: '682001' },
          { num: '797001' },
          { num: '563101' },
          { num: '416003' },
          { num: '416012' },
          { num: '691001' },
          { num: '571440' },
          { num: '796081' },
          { num: '795129' },
          { num: '577126' },
          { num: '583231' },
          { num: '764020' },
          { num: '495667' },
          { num: '324001' },
          { num: '533233' },
          { num: '507101' },
          { num: '691506' },
          { num: '686001' },
          { num: '628501' },
          { num: '534350' },
          { num: '796070' },
          { num: '673001' },
          { num: '673020' },
          { num: '635001' },
          { num: '575001' },
          { num: '575005' },
          { num: '799204' },
          { num: '639104' },
          { num: '175101' },
          { num: '796005' },
          { num: '799264' },
          { num: '612001' },
          { num: '581343' },
          { num: '576201' },
          { num: '799006' },
          { num: '680503' },
          { num: '273008' },
          { num: '132118' },
          { num: '403705' },
          { num: '793004' },
          { num: '794002' },
          { num: '846001' },
          { num: '796471' },
          { num: '229206' },
          { num: '284403' },
          { num: '795010' },
          { num: '795004' },
          { num: '795140' },
          { num: '246155' },
          { num: '786631' },
          { num: '413512' },
          { num: '194101' },
          { num: '793010' },
          { num: '793003' },
          { num: '791125' },
          { num: '795130' },
          { num: '795124' },
          { num: '403728' },
          { num: '796891' },
          { num: '226003' },
          { num: '226001' },
          { num: '141001' },
          { num: '796370' },
          { num: '796701' },
          { num: '796730' },
          { num: '521001' },
          { num: '305801' },
          { num: '383315' },
          { num: '248110' },
          { num: '847211' },
          { num: '571201' },
          { num: '600001' },
          { num: '625001' },
          { num: '509001' },
          { num: '506101' },
          { num: '384001' },
          { num: '400016' },
          { num: '797106' },
          { num: '797114' },
          { num: '205001' },
          { num: '403723' },
          { num: '341505' },
          { num: '799265' },
          { num: '676505' },
          { num: '723101' },
          { num: '423203' },
          { num: '735221' },
          { num: '416606' },
          { num: '796441' },
          { num: '630606' },
          { num: '504208' },
          { num: '533308' },
          { num: '403601' },
          { num: '175001' },
          { num: '794112' },
          { num: '481661' },
          { num: '458001' },
          { num: '400003' },
          { num: '370465' },
          { num: '571401' },
          { num: '522203' },
          { num: '784125' },
          { num: '575001' },
          { num: '737116' },
          { num: '576119' },
          { num: '795002' },
          { num: '799143' },
          { num: '799275' },
          { num: '795150' },
          { num: '403601' },
          { num: '841418' },
          { num: '523316' },
          { num: '799159' },
          { num: '275101' },
          { num: '690101' },
          { num: '313203' },
          { num: '793121' },
          { num: '744204' },
          { num: '795132' },
          { num: '609001' },
          { num: '791104' },
          { num: '792051' },
          { num: '502110' },
          { num: '792122' },
          { num: '250001' },
          { num: '250002' },
          { num: '799115' },
          { num: '612002' },
          { num: '403507' },
          { num: '641301' },
          { num: '682529' },
          { num: '416410' },
          { num: '231001' },
          { num: '142001' },
          { num: '799211' },
          { num: '799142' },
          { num: '795133' },
          { num: '798621' },
          { num: '811201' },
          { num: '798604' },
          { num: '244001' },
          { num: '795131' },
          { num: '474006' },
          { num: '363641' },
          { num: '476001' },
          { num: '793114' },
          { num: '793012' },
          { num: '508207' },
          { num: '586212' },
          { num: '400080' },
          { num: '400001' },
          { num: '400008' },
          { num: '403803' },
          { num: '444107' },
          { num: '251001' },
          { num: '842001' },
          { num: '600004' },
          { num: '570001' },
          { num: '741302' },
          { num: '387001' },
          { num: '782001' },
          { num: '341001' },
          { num: '629001' },
          { num: '798622' },
          { num: '440001' },
          { num: '173001' },
          { num: '791110' },
          { num: '263001' },
          { num: '781335' },
          { num: '508001' },
          { num: '637001' },
          { num: '795134' },
          { num: '737126' },
          { num: '792123' },
          { num: '792103' },
          { num: '431601' },
          { num: '518501' },
          { num: '794107' },
          { num: '793009' },
          { num: '793041' },
          { num: '571301' },
          { num: '531116' },
          { num: '611001' },
          { num: '582207' },
          { num: '123001' },
          { num: '487001' },
          { num: '422001' },
          { num: '305601' },
          { num: '380009' },
          { num: '396445' },
          { num: '208002' },
          { num: '805110' },
          { num: '793105' },
          { num: '752069' },
          { num: '524126' },
          { num: '332713' },
          { num: '458441' },
          { num: '524001' },
          { num: '403104' },
          { num: '324007' },
          { num: '695121' },
          { num: '624208' },
          { num: '791109' },
          { num: '503001' },
          { num: '793102' },
          { num: '793119' },
          { num: '787001' },
          { num: '795147' },
          { num: '403604' },
          { num: '521201' },
          { num: '678002' },
          { num: '523001' },
          { num: '285001' },
          { num: '413501' },
          { num: '679101' },
          { num: '274304' },
          { num: '795114' },
          { num: '799263' },
          { num: '686575' },
          { num: '678001' },
          { num: '534260' },
          { num: '176061' },
          { num: '627002' },
          { num: '795135' },
          { num: '401404' },
          { num: '306401' },
          { num: '517408' },
          { num: '403001' },
          { num: '403711' },
          { num: '413304' },
          { num: '799277' },
          { num: '799260' },
          { num: '132103' },
          { num: '488001' },
          { num: '410206' },
          { num: '614205' },
          { num: '623707' },
          { num: '444805' },
          { num: '431401' },
          { num: '600003' },
          { num: '506164' },
          { num: '761200' },
          { num: '400057' },
          { num: '532501' },
          { num: '791102' },
          { num: '384265' },
          { num: '689645' },
          { num: '147001' },
          { num: '800001' },
          { num: '614601' },
          { num: '246001' },
          { num: '505172' },
          { num: '793110' },
          { num: '797101' },
          { num: '625601' },
          { num: '683542' },
          { num: '144401' },
          { num: '796431' },
          { num: '799290' },
          { num: '799214' },
          { num: '797108' },
          { num: '762001' },
          { num: '794104' },
          { num: '793008' },
          { num: '262001' },
          { num: '262501' },
          { num: '642001' },
          { num: '679577' },
          { num: '605001' },
          { num: '360575' },
          { num: '744101' },
          { num: '230001' },
          { num: '516360' },
          { num: '622001' },
          { num: '516115' },
          { num: '691305' },
          { num: '411001' },
          { num: '411002' },
          { num: '797107' },
          { num: '752001' },
          { num: '854301' },
          { num: '744101' },
          { num: '574201' },
          { num: '673305' },
          { num: '560032' },
          { num: '799153' },
          { num: '229001' },
          { num: '742225' },
          { num: '591317' },
          { num: '584101' },
          { num: '496001' },
          { num: '492001' },
          { num: '757043' },
          { num: '464551' },
          { num: '560010' },
          { num: '516115' },
          { num: '533101' },
          { num: '626117' },
          { num: '465661' },
          { num: '360001' },
          { num: '799158' },
          { num: '491441' },
          { num: '185131' },
          { num: '140401' },
          { num: '533255' },
          { num: '623501' },
          { num: '591123' },
          { num: '829112' },
          { num: '679577' },
          { num: '605001' },
          { num: '360575' },
          { num: '744101' },
          { num: '230001' },
          { num: '516360' },
          { num: '622001' },
          { num: '516115' },
          { num: '691305' },
          { num: '411001' },
          { num: '411002' },
          { num: '797107' },
          { num: '752001' },
          { num: '854301' },
          { num: '744101' },
          { num: '574201' },
          { num: '673305' },
          { num: '560032' },
          { num: '799153' },
          { num: '229001' },
          { num: '742225' },
          { num: '591317' },
          { num: '584101' },
          { num: '496001' },
          { num: '492001' },
          { num: '757043' },
          { num: '464551' },
          { num: '560010' },
          { num: '516115' },
          { num: '533101' },
          { num: '626117' },
          { num: '465661' },
          { num: '360001' },
          { num: '799158' },
          { num: '491441' },
          { num: '185131' },
          { num: '140401' },
          { num: '533255' },
          { num: '623501' },
          { num: '591123' },
          { num: '829112' },
          { num: '791113' },
          { num: '796012' },
          { num: '799002' },
          { num: '244901' },
          { num: '172001' },
          { num: '731224' },
          { num: '741201' },
          { num: '834001' },
          { num: '737126' },
          { num: '713347' },
          { num: '834001' },
          { num: '737126' },
          { num: '713347' },
          { num: '263645' },
          { num: '632401' },
          { num: '581115' },
          { num: '221712' },
          { num: '331022' },
          { num: '641002' },
          { num: '457001' },
          { num: '415612' },
          { num: '765001' },
          { num: '796501' },
          { num: '533342' },
          { num: '172107' },
          { num: '522265' },
          { num: '794108' },
          { num: '380002' },
          { num: '486001' },
          { num: '124001' },
          { num: '794110' },
          { num: '794114' },
          { num: '247667' },
          { num: '769001' },
          { num: '140001' },
          { num: '577401' },
          { num: '470001' },
          { num: '247001' },
          { num: '852201' },
          { num: '796901' },
          { num: '790103' },
          { num: '795117' },
          { num: '796410' },
          { num: '796261' },
          { num: '636001' },
          { num: '711106' },
          { num: '533440' },
          { num: '848101' },
          { num: '768001' },
          { num: '303604' },
          { num: '241204' },
          { num: '502001' },
          { num: '416416' },
          { num: '796810' },
          { num: '148001' },
          { num: '627756' },
          { num: '485001' },
          { num: '403005' },
          { num: '570009' },
          { num: '821115' },
          { num: '415001' },
          { num: '522403' },
          { num: '322001' },
          { num: '416510' },
          { num: '500003' },
          { num: '466001' },
          { num: '795136' },
          { num: '795106' },
          { num: '792111' },
          { num: '480661' },
          { num: '790102' },
          { num: '712201' },
          { num: '796181' },
          { num: '799145' },
          { num: '585228' },
          { num: '484001' },
          { num: '242001' },
          { num: '303103' },
          { num: '465001' },
          { num: '799278' },
          { num: '247776' },
          { num: '302016' },
          { num: '342003' },
          { num: '799213' },
          { num: '793001' },
          { num: '171001' },
          { num: '577201' },
          { num: '403103' },
          { num: '411005' },
          { num: '403517' },
          { num: '473551' },
          { num: '585224' },
          { num: '532001' },
          { num: '517644' },
          { num: '413709' },
          { num: '785640' },
          { num: '502103' },
          { num: '486661' },
          { num: '788001' },
          { num: '799213' },
          { num: '795139' },
          { num: '795137' },
          { num: '609110' },
          { num: '307001' },
          { num: '125055' },
          { num: '581401' },
          { num: '843301' },
          { num: '261001' },
          { num: '626123' },
          { num: '841226' },
          { num: '173212' },
          { num: '413001' },
          { num: '795144' },
          { num: '131001' },
          { num: '620006' },
          { num: '335001' },
          { num: '332715' },
          { num: '190001' },
          { num: '571438' },
          { num: '628601' },
          { num: '600016' },
          { num: '509301' },
          { num: '500027' },
          { num: '795101' },
          { num: '574239' },
          { num: '228001' },
          { num: '793104' },
          { num: '799131' },
          { num: '770001' },
          { num: '174402' },
          { num: '636005' },
          { num: '395003' },
          { num: '363001' },
          { num: '508213' },
          { num: '534101' },
          { num: '515411' },
          { num: '670141' },
          { num: '625002' },
          { num: '600045' },
          { num: '501141' },
          { num: '534211' },
          { num: '143401' },
          { num: '249001' },
          { num: '532201' },
          { num: '799205' },
          { num: '522201' },
          { num: '627811' },
          { num: '784001' },
          { num: '670101' },
          { num: '400601' },
          { num: '613001' },
          { num: '796075' },
          { num: '796581' },
          { num: '796161' },
          { num: '602001' },
          { num: '695001' },
          { num: '685584' },
          { num: '680001' },
          { num: '629175' },
          { num: '621010' },
          { num: '621010' },
          { num: '600017' },
          { num: '695014' },
          { num: '472001' },
          { num: '590006' },
          { num: '604001' },
          { num: '786125' },
          { num: '572210' },
          { num: '628215' },
          { num: '637211' },
          { num: '620001' },
          { num: '605757' },
          { num: '627001' },
          { num: '517501' },
          { num: '635601' },
          { num: '641601' },
          { num: '676101' },
          { num: '614713' },
          { num: '689101' },
          { num: '606601' },
          { num: '610001' },
          { num: '403406' },
          { num: '734224' },
          { num: '304001' },
          { num: '500015' },
          { num: '799256' },
          { num: '796911' },
          { num: '572101' },
          { num: '628001' },
          { num: '643001' },
          { num: '313001' },
          { num: '642126' },
          { num: '182101' },
          { num: '576101' },
          { num: '456001' },
          { num: '795142' },
          { num: '793123' },
          { num: '174303' },
          { num: '793122' },
          { num: '384170' },
          { num: '209801' },
          { num: '793006' },
          { num: '793005' },
          { num: '680582' },
          { num: '673101' },
          { num: '390001' },
          { num: '686141' },
          { num: '796101' },
          { num: '796009' },
          { num: '382870' },
          { num: '396001' },
          { num: '221002' },
          { num: '403802' },
          { num: '412212' },
          { num: '632001' },
          { num: '362265' },
          { num: '464001' },
          { num: '792055' },
          { num: '520001' },
          { num: '501101' },
          { num: '605602' },
          { num: '799015' },
          { num: '626001' },
          { num: '530001' },
          { num: '384315' },
          { num: '531202' },
          { num: '530004' },
          { num: '509103' }, { num: '506002' },
          { num: '442001' },
          { num: '794111' },
          { num: '797111' },
          { num: '585201' },
          { num: '445001' },
          { num: '452004' },
          { num: '798617' },
          { num: '502220' },
          { num: '232329' },
          { num: '798620' },








        ]

    }

    else {
      this._router.navigate(['/auth/login']);
    }
    // this.vendorRegistrationFormGroup.get('Type').value;
    // if(this.vendorRegistrationFormGroup.get('Type').value.toLowerCase() === "domestic supply"){
    this.AllIdentityTypes = [
      { Key: 'GSTIN', Value: '1' },
      { Key: 'Lease based/Rental', Value: '2' },
      { Key: 'TDS Applicable', Value: '3' },
      { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
      { Key: 'MSME Registered', Value: '5' },
      { Key: 'Annual Revenue', Value: '6' },
      { Key: 'Employee Strength', Value: '7' },
      { Key: 'Legal Structure / Form of Business', Value: '8' }];
    // }
  }
  private _filterlandline(value: string): any {
    const filterValue1 = value.toLowerCase();
    // console.log("landline below")
    // console.log(this.lanline.filter(landline => landline.num.indexOf(filterValue1) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue1) === 0);

  }
  private _filterlandline1(value: string): any {
    const filterValue2 = value.toLowerCase();
    // console.log("landline below")
    // console.log(this.lanline.filter(landline => landline.num.indexOf(filterValue2) === 0))
    return this.lanline.filter(landline => landline.num.indexOf(filterValue2) === 0);

  }
  private _filter(value: any): any[] {
    const filterValue = value.toLowerCase();

    // console.log("filter" + this.AllCountries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0));
    return this.AllCountries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
  }
  phonelandline() {

  }
  private _filterstate(value: any): any[] {
    const filterValuestate = value.toLowerCase();

    return this.AllStates.filter(sta => sta.State.toLowerCase().indexOf(filterValuestate) === 0);
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


  GetVendorOnBoardingsByEmailID(): void {
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.GetVendorOnBoardingsByEmailID(this.authenticationDetails.EmailAddress).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.BPVendorOnBoarding = <BPVendorOnBoarding>data;
        if (this.BPVendorOnBoarding) {
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

  onArrowBackClick(): void {
    this._router.navigate(['/auth/login']);
  }

  InitializeVendorRegistrationFormGroup(): void {
    this.vendorRegistrationFormGroup = this._formBuilder.group({
      Name: ['', [Validators.required, Validators.maxLength(40)]],
      Role: ['Vendor', Validators.required],
      LegalName: ['', [Validators.required, Validators.maxLength(40)]],
      AddressLine1: ['', Validators.required],
      AddressLine2: ['', Validators.required],
      City: ['', Validators.required],
      WebsiteAddress: [''],
      Invoice: [''],
      State: ['', Validators.required],
      Country: ['India', [Validators.required]],
      // ,this.countryDomain
      PinCode: ['', [Validators.required, Validators.pattern('^\\d{4,10}$')]],
      Type: [''],
      // Invoice:[''],
      Phone1: ['', [Validators.required, Validators.maxLength(15), Validators.pattern("^[0-9]{7,15}$")]],
      Phone2: ['', [Validators.maxLength(15), Validators.pattern("^[0-9]{7,15}$")]],

      Email1: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      Email2: ['', [Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      Field1: [''],
      Field2: [''],
      Field3: [''],
      Field4: [''],
      Field5: [''],
      Field6: [''],
      Field7: [''],
      Field8: [''],
      Field9: [''],
      Field10: [''],
    });
    // this.vendorRegistrationFormGroup.get('City').disable();
    // this.vendorRegistrationFormGroup.get('State').disable();
    this.vendorRegistrationFormGroup.get('Country').disable();
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
  indiacountry() {
    //  this.country_india=this.vendorRegistrationFormGroup.get("Country").value
    this.country_india_lower = this.Country.toLocaleLowerCase()
    if (this.country_india_lower == "india") {
      this.vendorRegistrationFormGroup.get("Country").markAsTouched();
      this.vendorRegistrationFormGroup.controls['Country'].setErrors({ 'incorrect': true });
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
      IDNumber: ['', Validators.required],
      ValidUntil: [''],
    });
    this.InitializeIdentificationTable();
    this.identificationFormGroup.get('Option').disable();
    // this.identificationFormGroup.get('Type').disable();
  }
  InitializeIdentificationTable(): void {
    const bPIdentity = new BPIdentity();
    this.IdentificationsByVOB.push(bPIdentity);
    this.IdentificationsByVOB.push(bPIdentity);
    this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
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
    this.InitializeBankDetailsTable();
  }
  InitializeBankDetailsTable(): void {
    const bPIdentity = new BPBank();
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
      Email: ['', [Validators.required, Validators.email]],
    });
    this.InitializeContactTable();
  }
  InitializeContactTable(): void {
    const bPIdentity = new BPContact();
    this.ContactsByVOB.push(bPIdentity);
    this.ContactsByVOB.push(bPIdentity);
    this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
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
  InitializeQuestionsFormGroup(): void {
    this.questionFormGroup = this._formBuilder.group({
      questions: this.questionsFormArray
    });
  }
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
    this.fileToUpload1 = null;
    this.fileToUploadList = [];
    this.ClearIdentificationFormGroup();
    this.ClearBankDetailsFormGroup();
    this.ClearContactFormGroup();
    this.ClearQuestionFormGroup();
    this.ClearActivityLogFormGroup();
    this.ClearIdentificationDataSource();
    this.ClearBankDetailsDataSource();
    this.ClearContactDataSource();
    this.ClearActivityLogDataSource();
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

  ClearActivityLogFormGroup(): void {
    this.activityLogFormGroup.reset();
    Object.keys(this.activityLogFormGroup.controls).forEach(key => {
      this.activityLogFormGroup.get(key).markAsUntouched();
    });
  }
  ClearQuestionFormGroup(): void {
    this.questionFormGroup.reset();
    Object.keys(this.questionFormGroup.controls).forEach(key => {
      this.questionFormGroup.get(key).markAsUntouched();
    });
    this.ClearFormArray(this.questionsFormArray);
    // this.questionsFormArray = this._formBuilder.array([]);
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
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
  Countrycodefunc(country) {


    console.log("country:" + country);
    this.codeselected = country.countycode
    console.log(this.codeselected)
  }
  TypeSelected(event): void {
    if (event.value) {
      const selecteType = event.value as string;
      if (selecteType && selecteType === '3') {
        this.vendorRegistrationFormGroup.get('Country').enable();
        this.Country = '';
        this.titlevalue = "Import";
        this.AllCountries = [
          { name: 'Afghanistan', code: 'AF', countycode: '+93' },
          { name: 'Åland Islands', code: 'AX', countycode: '+358' },
          { name: 'Albania', code: 'AL', countycode: '+355' },
          { name: 'Algeria', code: 'DZ', countycode: '+213' },
          { name: 'American Samoa', code: 'AS', countycode: '+1-684' },
          { name: 'AndorrA', code: 'AD', countycode: '+376' },
          { name: 'Angola', code: 'AO', countycode: '+344' },
          { name: 'Anguilla', code: 'AI', countycode: '+1-264' },
          { name: 'Antarctica', code: 'AQ', countycode: '+672' },
          { name: 'Antigua and Barbuda', code: 'AG', countycode: '+1-268' },
          { name: 'Argentina', code: 'AR', countycode: '+54' },
          { name: 'Armenia', code: 'AM', countycode: '+374' },
          { name: 'Aruba', code: 'AW', countycode: '+297' },
          { name: 'Australia', code: 'AU', countycode: '+61' },
          { name: 'Austria', code: 'AT', countycode: '+43' },
          { name: 'Azerbaijan', code: 'AZ', countycode: '+994' },
          { name: 'Bahamas', code: 'BS', countycode: '+1-242' },
          { name: 'Bahrain', code: 'BH', countycode: '+973' },
          { name: 'Bangladesh', code: 'BD', countycode: '+880' },
          { name: 'Barbados', code: 'BB', countycode: '+1-246' },
          { name: 'Belarus', code: 'BY', countycode: '+375' },
          { name: 'Belgium', code: 'BE', countycode: '+32' },
          { name: 'Belize', code: 'BZ', countycode: '+501' },
          { name: 'Benin', code: 'BJ', countycode: '+229' },
          { name: 'Bermuda', code: 'BM', countycode: '+1-441' },
          { name: 'Bhutan', code: 'BT', countycode: '+975' },
          { name: 'Bolivia', code: 'BO', countycode: '+591' },
          { name: 'Bosnia and Herzegovina', code: 'BA', countycode: '+387' },
          { name: 'Botswana', code: 'BW', countycode: '+267' },
          { name: 'Bouvet Island', code: 'BV', countycode: '+3166-2' },
          { name: 'Brazil', code: 'BR', countycode: '+55' },
          { name: 'British Indian Ocean Territory', code: 'IO', countycode: '+246' },
          { name: 'Brunei Darussalam', code: 'BN', countycode: '+673' },
          { name: 'Bulgaria', code: 'BG', countycode: '+359' },
          { name: 'Burkina Faso', code: 'BF', countycode: '+226' },
          { name: 'Burundi', code: 'BI', countycode: '+257' },
          { name: 'Cambodia', code: 'KH', countycode: '+855' },
          { name: 'Cameroon', code: 'CM', countycode: '+237' },
          { name: 'Canada', code: 'CA', countycode: '+1' },
          { name: 'Cape Verde', code: 'CV', countycode: '+238' },
          { name: 'Cayman Islands', code: 'KY', countycode: '+1-345' },
          { name: 'Central African Republic', code: 'CF', countycode: '+236' },
          { name: 'Chad', code: 'TD', countycode: '+235' },
          { name: 'Chile', code: 'CL', countycode: '+56' },
          { name: 'China', code: 'CN', countycode: '+86' },
          { name: 'Christmas Island', code: 'CX', countycode: '+61' },
          { name: 'Cocos (Keeling) Islands', code: 'CC', countycode: '+61' },
          { name: 'Colombia', code: 'CO', countycode: '+57' },
          { name: 'Comoros', code: 'KM', countycode: '+269' },
          { name: 'Congo', code: 'CG', countycode: '+242' },
          { name: 'Congo, The Democratic Republic of the', code: 'CD', countycode: '+243' },
          { name: 'Cook Islands', code: 'CK', countycode: '+682' },
          { name: 'Costa Rica', code: 'CR', countycode: '+506' },
          { name: 'Cote D\'Ivoire', code: 'CI', countycode: '+225' },
          { name: 'Croatia', code: 'HR', countycode: '+385' },
          { name: 'Cuba', code: 'CU', countycode: '+53' },
          { name: 'Cyprus', code: 'CY', countycode: '+357' },
          { name: 'Czech Republic', code: 'CZ', countycode: '+420' },
          { name: 'Denmark', code: 'DK', countycode: '+45' },
          { name: 'Djibouti', code: 'DJ', countycode: '+253' },
          { name: 'Dominica', code: 'DM', countycode: '+1-767' },
          { name: 'Dominican Republic', code: 'DO', countycode: '+1-809' },
          { name: 'Ecuador', code: 'EC', countycode: '+593' },
          { name: 'Egypt', code: 'EG', countycode: '+20' },
          { name: 'El Salvador', code: 'SV', countycode: '+503' },
          { name: 'Equatorial Guinea', code: 'GQ', countycode: '+240' },
          { name: 'Eritrea', code: 'ER', countycode: '+291' },
          { name: 'Estonia', code: 'EE', countycode: '+372' },
          { name: 'Ethiopia', code: 'ET', countycode: '+251' },
          { name: 'Falkland Islands (Malvinas)', code: 'FK', countycode: '+500' },
          { name: 'Faroe Islands', code: 'FO', countycode: '+298' },
          { name: 'Fiji', code: 'FJ', countycode: '+679' },
          { name: 'Finland', code: 'FI', countycode: '+358' },
          { name: 'France', code: 'FR', countycode: '+33' },
          { name: 'French Guiana', code: 'GF', countycode: '+594' },
          { name: 'French Polynesia', code: 'PF', countycode: '+689' },
          { name: 'French Southern Territories', code: 'TF', countycode: '+262' },
          { name: 'Gabon', code: 'GA', countycode: '+241' },
          { name: 'Gambia', code: 'GM', countycode: '+220' },
          { name: 'Georgia', code: 'GE', countycode: '+995' },
          { name: 'Germany', code: 'DE', countycode: '+49' },
          { name: 'Ghana', code: 'GH', countycode: '+233' },
          { name: 'Gibraltar', code: 'GI', countycode: '+350' },
          { name: 'Greece', code: 'GR', countycode: '+30' },
          { name: 'Greenland', code: 'GL', countycode: '+299' },
          { name: 'Grenada', code: 'GD', countycode: '+1-473' },
          { name: 'Guadeloupe', code: 'GP', countycode: '+590' },
          { name: 'Guam', code: 'GU', countycode: '+1-671' },
          { name: 'Guatemala', code: 'GT', countycode: '+502' },
          { name: 'Guernsey', code: 'GG', countycode: '+44-1481' },
          { name: 'Guinea', code: 'GN', countycode: '+224' },
          { name: 'Guinea-Bissau', code: 'GW', countycode: '+245' },
          { name: 'Guyana', code: 'GY', countycode: '+592' },
          { name: 'Haiti', code: 'HT', countycode: '+509' },
          { name: 'Heard Island and Mcdonald Islands', code: 'HM', countycode: '+672' },
          { name: 'Holy See (Vatican City State)', code: 'VA', countycode: '+379' },
          { name: 'Honduras', code: 'HN', countycode: '+504' },
          { name: 'Hong Kong', code: 'HK', countycode: '+852' },
          { name: 'Hungary', code: 'HU', countycode: '+36' },
          { name: 'Iceland', code: 'IS', countycode: '+354' },
          // { name: 'India', code: 'IN' },
          { name: 'Indonesia', code: 'ID', countycode: '+62' },
          { name: 'Iran, Islamic Republic Of', code: 'IR', countycode: '+98' },
          { name: 'Iraq', code: 'IQ', countycode: '+964' },
          { name: 'Ireland', code: 'IE', countycode: '+353' },
          { name: 'Isle of Man', code: 'IM', countycode: '+44-1624' },
          { name: 'Israel', code: 'IL', countycode: '+972' },
          { name: 'Italy', code: 'IT', countycode: '+39' },
          { name: 'Jamaica', code: 'JM', countycode: '+1-876' },
          { name: 'Japan', code: 'JP', countycode: '+81' },
          { name: 'Jersey', code: 'JE', countycode: '+44-1534' },
          { name: 'Jordan', code: 'JO', countycode: '+962' },
          { name: 'Kazakhstan', code: 'KZ', countycode: '+7' },
          { name: 'Kenya', code: 'KE', countycode: '+254' },
          { name: 'Kiribati', code: 'KI', countycode: '+686' },
          { name: 'Korea, Democratic People\'S Republic of', code: 'KP', countycode: '+850' },
          { name: 'Korea, Republic of', code: 'KR', countycode: '+82' },
          { name: 'Kuwait', code: 'KW', countycode: '+965' },
          { name: 'Kyrgyzstan', code: 'KG', countycode: '+996' },
          { name: 'Lao People\'S Democratic Republic', code: 'LA', countycode: '+856' },
          { name: 'Latvia', code: 'LV', countycode: '+371' },
          { name: 'Lebanon', code: 'LB', countycode: '+961' },
          { name: 'Lesotho', code: 'LS', countycode: '+266' },
          { name: 'Liberia', code: 'LR', countycode: '+231' },
          { name: 'Libyan Arab Jamahiriya', code: 'LY', countycode: '+218' },
          { name: 'Liechtenstein', code: 'LI', countycode: '+423' },
          { name: 'Lithuania', code: 'LT', countycode: '+370' },
          { name: 'Luxembourg', code: 'LU', countycode: '+352' },
          { name: 'Macao', code: 'MO', countycode: '+853' },
          { name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK', countycode: '+389' },
          { name: 'Madagascar', code: 'MG', countycode: '+261' },
          { name: 'Malawi', code: 'MW', countycode: '+265' },
          { name: 'Malaysia', code: 'MY', countycode: '+60' },
          { name: 'Maldives', code: 'MV', countycode: '+960' },
          { name: 'Mali', code: 'ML', countycode: '+223' },
          { name: 'Malta', code: 'MT', countycode: '+356' },
          { name: 'Marshall Islands', code: 'MH', countycode: '+692' },
          { name: 'Martinique', code: 'MQ', countycode: '+596' },
          { name: 'Mauritania', code: 'MR', countycode: '+222' },
          { name: 'Mauritius', code: 'MU', countycode: '+230' },
          { name: 'Mayotte', code: 'YT', countycode: '+262' },
          { name: 'Mexico', code: 'MX', countycode: '+52' },
          { name: 'Micronesia, Federated States of', code: 'FM', countycode: '+691' },
          { name: 'Moldova, Republic of', code: 'MD', countycode: '+373' },
          { name: 'Monaco', code: 'MC', countycode: '+377' },
          { name: 'Mongolia', code: 'MN', countycode: '+976' },
          { name: 'Montserrat', code: 'MS', countycode: '+1-664' },
          { name: 'Morocco', code: 'MA', countycode: '+212' },
          { name: 'Mozambique', code: 'MZ', countycode: '+258' },
          { name: 'Myanmar', code: 'MM', countycode: '+95' },
          { name: 'Namibia', code: 'NA', countycode: '+264' },
          { name: 'Nauru', code: 'NR', countycode: '+674' },
          { name: 'Nepal', code: 'NP', countycode: '+977' },
          { name: 'Netherlands', code: 'NL', countycode: '+31' },
          { name: 'Netherlands Antilles', code: 'AN', countycode: '+599' },
          { name: 'New Caledonia', code: 'NC', countycode: '+687' },
          { name: 'New Zealand', code: 'NZ', countycode: '+64' },
          { name: 'Nicaragua', code: 'NI', countycode: '+505' },
          { name: 'Niger', code: 'NE', countycode: '+227' },
          { name: 'Nigeria', code: 'NG', countycode: '+234' },
          { name: 'Niue', code: 'NU', countycode: '+683' },
          { name: 'Norfolk Island', code: 'NF', countycode: '+672' },
          { name: 'Northern Mariana Islands', code: 'MP', countycode: '+1' },
          { name: 'Norway', code: 'NO', countycode: '+47' },
          { name: 'Oman', code: 'OM', countycode: '+968' },
          { name: 'Pakistan', code: 'PK', countycode: '+92' },
          { name: 'Palau', code: 'PW', countycode: '+680' },
          { name: 'Palestinian Territory, Occupied', code: 'PS', countycode: '+970' },
          { name: 'Panama', code: 'PA', countycode: '+507' },
          { name: 'Papua New Guinea', code: 'PG', countycode: '+675' },
          { name: 'Paraguay', code: 'PY', countycode: '+595' },
          { name: 'Peru', code: 'PE', countycode: '+51' },
          { name: 'Philippines', code: 'PH', countycode: '+63' },
          { name: 'Pitcairn', code: 'PN', countycode: '+64' },
          { name: 'Poland', code: 'PL', countycode: '+48' },
          { name: 'Portugal', code: 'PT', countycode: '+351' },
          { name: 'Puerto Rico', code: 'PR', countycode: '+1-787' },
          { name: 'Qatar', code: 'QA', countycode: '+974' },
          { name: 'Reunion', code: 'RE', countycode: '+262' },
          { name: 'Romania', code: 'RO', countycode: '+40' },
          { name: 'Russian Federation', code: 'RU', countycode: '+7' },
          { name: 'RWANDA', code: 'RW', countycode: '+250' },
          { name: 'Saint Helena', code: 'SH', countycode: '+590' },
          { name: 'Saint Kitts and Nevis', code: 'KN', countycode: '+1-869' },
          { name: 'Saint Lucia', code: 'LC', countycode: '+1-758' },
          { name: 'Saint Pierre and Miquelon', code: 'PM', countycode: '+508' },
          { name: 'Saint Vincent and the Grenadines', code: 'VC', countycode: '+1-784' },
          { name: 'Samoa', code: 'WS', countycode: '+685' },
          { name: 'San Marino', code: 'SM', countycode: '+378' },
          { name: 'Sao Tome and Principe', code: 'ST', countycode: '+239' },
          { name: 'Saudi Arabia', code: 'SA', countycode: '+966' },
          { name: 'Senegal', code: 'SN', countycode: '+221' },
          { name: 'Serbia and Montenegro', code: 'CS', countycode: '+381' },
          { name: 'Seychelles', code: 'SC', countycode: '+248' },
          { name: 'Sierra Leone', code: 'SL', countycode: '+232' },
          { name: 'Singapore', code: 'SG', countycode: '+65' },
          { name: 'Slovakia', code: 'SK', countycode: '+421' },
          { name: 'Slovenia', code: 'SI', countycode: '+386' },
          { name: 'Solomon Islands', code: 'SB', countycode: '+677' },
          { name: 'Somalia', code: 'SO', countycode: '+252' },
          { name: 'South Africa', code: 'ZA', countycode: '+27' },
          { name: 'South Georgia and the South Sandwich Islands', code: 'GS', countycode: '+500' },
          { name: 'Spain', code: 'ES', countycode: '+34' },
          { name: 'Sri Lanka', code: 'LK', countycode: '+94' },
          { name: 'Sudan', code: 'SD', countycode: '+249' },
          { name: 'Suriname', code: 'SR', countycode: '+597' },
          { name: 'Svalbard and Jan Mayen', code: 'SJ', countycode: '+47' },
          { name: 'Swaziland', code: 'SZ', countycode: '+268' },
          { name: 'Sweden', code: 'SE', countycode: '+46' },
          { name: 'Switzerland', code: 'CH', countycode: '+41' },
          { name: 'Syrian Arab Republic', code: 'SY', countycode: '+963' },
          { name: 'Taiwan, Province of China', code: 'TW' },


          { name: 'Taiwan, Province of China', code: 'TW', countycode: '+886' },
          { name: 'Tajikistan', code: 'TJ', countycode: '+992' },
          { name: 'Tanzania, United Republic of', code: 'TZ', countycode: '+255' },
          { name: 'Thailand', code: 'TH', countycode: '+66' },
          { name: 'Timor-Leste', code: 'TL', countycode: '+670' },
          { name: 'Togo', code: 'TG', countycode: '+228' },
          { name: 'Tokelau', code: 'TK', countycode: '+690' },
          { name: 'Tonga', code: 'TO', countycode: '+676' },
          { name: 'Trinidad and Tobago', code: 'TT', countycode: '+1-868' },
          { name: 'Tunisia', code: 'TN', countycode: '+216' },
          { name: 'Turkey', code: 'TR', countycode: '+90' },
          { name: 'Turkmenistan', code: 'TM', countycode: '+993' },
          { name: 'Turks and Caicos Islands', code: 'TC', countycode: '+1-649' },
          { name: 'Tuvalu', code: 'TV', countycode: '+688' },
          { name: 'Uganda', code: 'UG', countycode: '+256' },
          { name: 'Ukraine', code: 'UA', countycode: '+380' },
          { name: 'United Arab Emirates', code: 'AE', countycode: '+971' },
          { name: 'United Kingdom', code: 'GB', countycode: '+44' },
          { name: 'United States', code: 'US', countycode: '+1' },
          { name: 'United States Minor Outlying Islands', code: 'UM', countycode: '+246' },
          { name: 'Uruguay', code: 'UY', countycode: '+598' },
          { name: 'Uzbekistan', code: 'UZ', countycode: '+998' },
          { name: 'Vanuatu', code: 'VU', countycode: '+678' },
          { name: 'Venezuela', code: 'VE', countycode: '+58' },
          { name: 'Viet Nam', code: 'VN', countycode: '+84' },
          { name: 'Virgin Islands, British', code: 'VG', countycode: '+1' },
          { name: 'Virgin Islands, U.S.', code: 'VI', countycode: '+1' },
          { name: 'Wallis and Futuna', code: 'WF', countycode: '+681' },
          { name: 'Western Sahara', code: 'EH', countycode: '+212' },
          { name: 'Yemen', code: 'YE', countycode: '+967' },
          { name: 'Zambia', code: 'ZM', countycode: '+260' },
          { name: 'Zimbabwe', code: 'ZW', countycode: '+263' }
        ];
        this.onKey(event);
        this.identificationFormGroup.get('Type').enable();
        this.AllIdentityTypes = [

          { Key: 'Lease based/Rental', Value: '2' },
          { Key: 'TDS Applicable', Value: '3' },
          { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
          { Key: 'MSME Registered', Value: '5' },
          { Key: 'Annual Revenue', Value: '6' },
          { Key: 'Employee Strength', Value: '7' },
          { Key: 'Legal Structure / Form of Business', Value: '8' }];
      } if (selecteType && selecteType === '2') {
        this.titlevalue = "Domestic Service";
        this.identificationFormGroup.get('Type').enable();
        this.vendorRegistrationFormGroup.get('Country').patchValue('India');
        this.vendorRegistrationFormGroup.get('Country').disable();
        this.AllIdentityTypes = [
          { Key: 'GSTIN', Value: '1' },
          { Key: 'Lease based/Rental', Value: '2' },
          { Key: 'TDS Applicable', Value: '3' },
          { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
          { Key: 'MSME Registered', Value: '5' },
          { Key: 'Annual Revenue', Value: '6' },
          { Key: 'Employee Strength', Value: '7' },
          { Key: 'Legal Structure / Form of Business', Value: '8' }];
        this.IdentificationsByVOB = [];
        console.log("Identification", this.AllIdentityTypes);
        for (var i = 0; i < this.AllIdentityTypes.length; i++) {
          const bPIdentity = new BPIdentity();
          bPIdentity.Type = this.AllIdentityTypes[i].Key;
          bPIdentity.IDNumber = '';
          bPIdentity.AttachmentName = '';
          this.IdentificationsByVOB.push(bPIdentity);
        }
        this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
      } if (selecteType && selecteType === '1') {
        this.identificationFormGroup.get('Type').enable();
        this.vendorRegistrationFormGroup.get('Country').patchValue('India');
        this.vendorRegistrationFormGroup.get('Country').disable();
        this.titlevalue = "Domestic Supply";
        this.AllIdentityTypes = [
          { Key: 'GSTIN', Value: '1' },
          { Key: 'Lease based/Rental', Value: '2' },
          { Key: 'TDS Applicable', Value: '3' },
          { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
          { Key: 'MSME Registered', Value: '5' },
          { Key: 'Annual Revenue', Value: '6' },
          { Key: 'Employee Strength', Value: '7' },
          { Key: 'Legal Structure / Form of Business', Value: '8' }];
        this.IdentificationsByVOB = [];
        console.log("Identification", this.AllIdentityTypes);
        for (var i = 0; i < this.AllIdentityTypes.length; i++) {
          const bPIdentity = new BPIdentity();
          bPIdentity.Type = this.AllIdentityTypes[i].Key;
          bPIdentity.IDNumber = '';
          bPIdentity.AttachmentName = '';
          this.IdentificationsByVOB.push(bPIdentity);
        }
        this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
      }
      else {
        this.vendorRegistrationFormGroup.get('Country').patchValue('India');
        this.vendorRegistrationFormGroup.get('Country').disable();
        this.AllIdentityTypes = [
          { Key: 'GSTIN', Value: '1' },
          { Key: 'Lease based/Rental', Value: '2' },
          { Key: 'TDS Applicable', Value: '3' },
          { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
          { Key: 'MSME Registered', Value: '5' },
          { Key: 'Annual Revenue', Value: '6' },
          { Key: 'Employee Strength', Value: '7' },
          { Key: 'Legal Structure / Form of Business', Value: '8' }];
        // this.identificationFormGroup.get('Type').disable();

      }
    }
  }
  onKey(event: any) {
    this.inputvalue = event.target.value;
    console.log(this.inputvalue, "asas");
    if (this.inputvalue.toLowerCase() === "india") {
      this.notificationSnackBarComponent.openSnackBar(`India is not Acceptable,Please Change the Country`, SnackBarStatus.danger, 5000);
    }
  }
  Emailvalue(event: any) {
    this.emailvalue = event.target.value;
    if (this.vendorRegistrationFormGroup.get('Email1').value === this.emailvalue) {
      this.notificationSnackBarComponent.openSnackBar(`Email is duplicate record`, SnackBarStatus.danger, 5000);
    }

  }

  typefunc(type) {
    console.log(type);
    this.type_option = type.Key;
    if ((type.Key == "Domestic Supply") || (type.Key == "Domestic Service")) {
      this.codeselected = "+91"
    }
  }


  OptionSelected(event): void {
    if (event.value) {
      const selecteoption = event.value as string;
      if (selecteoption && selecteoption === 'MSME Registered') {
        this.hiddenoption = true;
        this.identificationFormGroup.get('Option').enable();
        this.AllOption = [
          'Micro',
          'Small',
          'Medium'
        ]
      } else if (selecteoption && selecteoption === 'Annual Revenue') {
        this.hiddenoption = true;
        this.identificationFormGroup.get('Option').enable();
        this.AllOption = ['<100 cr INR', '100-200 cr INR', '200-300 cr INR', '300-500 cr INR', '500-100 cr INR', '1000-2000 cr INR', '>2000 cr INR']

      } else if (selecteoption && selecteoption === 'Employee Strength') {
        this.hiddenoption = true;
        this.identificationFormGroup.get('Option').enable();
        this.AllOption = ['<500', '500-1000', '1000-5000', '5000-10000', '>10000']
      } else if (selecteoption && selecteoption === 'Legal Structure / Form of Business') {
        this.hiddenoption = true;
        this.identificationFormGroup.get('Option').enable();
        this.AllOption = ['Public Limited Company(listed)', 'Public Limited Company(not listed)', 'Private Limited Company', 'Patnership', 'Sole Proprietorship', 'LLP']
      }
      else {
        this.hiddenoption = false;
        this.identificationFormGroup.get('Option').disable();
        this.identificationFormGroup.get('Option').patchValue('_____NIL_____');
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
  // RoleSelected(event): void {
  //   if (event.value) {
  //     const selecteRole = event.value as string;
  //     this.ClearQuestionFormGroup();
  //     this.GetQuestionAnswers(selecteRole);
  //   }
  // }
  // GetQuestionAnswers(selecteRole: string): void {
  //   this._vendorRegistrationService.GetQuestionAnswers('BPCloud', selecteRole).subscribe(
  //     (data) => {
  //       this.AllQuestionAnswersView = data as QuestionAnswersView[];
  //       this.AllQuestionAnswersView.forEach(x => {
  //         this.AddToQuestionsFormGroup(x);
  //       });
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
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
            if (this.TaxPayerDetails === null) {
              this.notificationSnackBarComponent.openSnackBar('Something went wrong while getting gstin details try after some time', SnackBarStatus.danger);
            }
          }
          else {
            this.IsProgressBarVisibile = false;
            this.vendorRegistrationFormGroup.get('City').patchValue('');
            this.vendorRegistrationFormGroup.get('State').patchValue('');
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

  GetQuestionAnswers(): void {
    this._vendorRegistrationService.GetQuestionAnswersByUser('BPCloud', this.CurrentUserRole, this.CurrentUserID).subscribe(
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
  AddToQuestionsFormGroup(question: QuestionAnswersView): void {
    const row = this._formBuilder.group({
      quest: [question.Answer, Validators.required],
    });
    this.questionsFormArray.push(row);
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
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(`${loc.Taluk}, ${loc.District}`);
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
      this._vendorMasterService.GetLocation(Pincode).subscribe(
        (data) => {
          // // const loc = data as CBPLocation;
          this.addressline1 = [];
          console.log('Data', data);
          if (data[0].Status === 'Success') {
            this.Postaldata = false;

            for (let i = 0; i < data[0].PostOffice.length; i++) {
              this.addressline1.push(data[0].PostOffice[i].Name);
            }
            // this.StateCode = loc.StateCode;
            this.vendorRegistrationFormGroup.get('City').patchValue(data[0].PostOffice[0].Division);
            this.vendorRegistrationFormGroup.get('State').patchValue(data[0].PostOffice[0].State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].PostOffice[0].Country);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(data[0].PostOffice[0].Division + ',' + data[0].PostOffice[0].Region);
            // this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
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
          //   this.StateCode = loc.StateCode;
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

  ValidateIdentityByType(IdentityType: any, ID: any): void {
    if (IdentityType) {
      this._vendorMasterService.ValidateIdentityByType(IdentityType, ID).subscribe(
        (data) => {
          const identity = data as CBPIdentity;
          if (identity) {
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
      this._vendorMasterService.GetLocation(Pincode).subscribe(
        (data) => {
          // // const loc = data as CBPLocation;
          this.addressline1 = [];
          console.log('Data', data);
          if (data[0].Status === 'Success') {
            this.Postaldata = false;

            for (let i = 0; i < data[0].PostOffice.length; i++) {
              this.addressline1.push(data[0].PostOffice[i].Name);
            }
            // this.StateCode = loc.StateCode;
            this.vendorRegistrationFormGroup.get('City').patchValue(data[0].PostOffice[0].Division);
            this.vendorRegistrationFormGroup.get('State').patchValue(data[0].PostOffice[0].State);
            this.vendorRegistrationFormGroup.get('Country').patchValue(data[0].PostOffice[0].Country);
            this.vendorRegistrationFormGroup.get('AddressLine2').patchValue(data[0].PostOffice[0].Division + ',' + data[0].PostOffice[0].Region);
            // this.vendorRegistrationFormGroup.get('CountryCode').patchValue(loc.CountryCode);
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
          //   this.StateCode = loc.StateCode;
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
    const ID = event.target.value;
    if (ID) {
      this.ValidateIdentityByType(this.IdentityType, ID);
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

  loadSelectedBPVendorOnBoarding(selectedBPVendorOnBoarding: BPVendorOnBoarding): void {
    this.ResetControl();
    this.SelectedBPVendorOnBoarding = selectedBPVendorOnBoarding;
    this.selectID = selectedBPVendorOnBoarding.TransID;
    this.EnableAllVendorOnBoardingTypes();
    this.SetBPVendorOnBoardingValues();
    this.GetBPVendorOnBoardingSubItems();
    this.GetQuestionAnswers();
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

  EnableAllVendorOnBoardingTypes(): void {
    Object.keys(this.vendorRegistrationFormGroup.controls).forEach(key => {
      this.vendorRegistrationFormGroup.get(key).enable();
    });
    this.vendorRegistrationFormGroup.get('Country').disable();
  }

  SetBPVendorOnBoardingValues(): void {
    this.vendorRegistrationFormGroup.get('Name').patchValue(this.SelectedBPVendorOnBoarding.Name);
    this.vendorRegistrationFormGroup.get('Type').patchValue(this.SelectedBPVendorOnBoarding.Type);

    if (this.SelectedBPVendorOnBoarding.Type === '1') {
      this.AllIdentityTypes = [
        { Key: 'GSTIN', Value: '1' },
        { Key: 'Lease based/Rental', Value: '2' },
        { Key: 'TDS Applicable', Value: '3' },
        { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
        { Key: 'MSME Registered', Value: '5' },
        { Key: 'Annual Revenue', Value: '6' },
        { Key: 'Employee Strength', Value: '7' },
        { Key: 'Legal Structure / Form of Business', Value: '8' }];
      this.titlevalue = "Domestic Supply";
      this.codeselected = "+91";
      this.InitializeBankDetailsTable();
    }
    else if (this.SelectedBPVendorOnBoarding.Type === '2') {
      // this. TypeSelected(2);
      this.titlevalue = "Domestic Service";
      this.AllIdentityTypes = [
        { Key: 'GSTIN', Value: '1' },
        { Key: 'Lease based/Rental', Value: '2' },
        { Key: 'TDS Applicable', Value: '3' },
        { Key: 'Latest cancelled cheque/letter from bank', Value: '4' },
        { Key: 'MSME Registered', Value: '5' },
        { Key: 'Annual Revenue', Value: '6' },
        { Key: 'Employee Strength', Value: '7' },
        { Key: 'Legal Structure / Form of Business', Value: '8' }];
      this.InitializeBankDetailsTable();

      this.codeselected = "+91";
    }
    else if (this.SelectedBPVendorOnBoarding.Type === '3') {

      this.titlevalue = "Import";
      this.AllIdentityTypes = [
        // {Key:'GSTIN', Value:'1'},
        { Key: 'Lease based/Rental', Value: '1' },
        { Key: 'TDS Applicable', Value: '2' },
        { Key: 'Latest cancelled cheque/letter from bank', Value: '3' },
        { Key: 'MSME Registered', Value: '4' },
        { Key: 'Annual Revenue', Value: '5' },
        { Key: 'Employee Strength', Value: '6' },
        { Key: 'Legal Structure / Form of Business', Value: '7' }];
      // this. TypeSelected(3);
      this.InitializeBankDetailsTable();
    }

    this.vendorRegistrationFormGroup.get('Role').patchValue(this.SelectedBPVendorOnBoarding.Role);
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
    this.vendorRegistrationFormGroup.get('Invoice').patchValue(this.SelectedBPVendorOnBoarding.Invoice);
    this.vendorRegistrationFormGroup.get('WebsiteAddress').patchValue(this.SelectedBPVendorOnBoarding.WebsiteAddress);
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
    // this.GetLocationDetailsByPincode(this.SelectedBPVendorOnBoarding.PinCode);
    // this.contactFormGroup.get('Email').validator({}as AbstractControl);
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
        if (this.SelectedBPVendorOnBoarding.TransID === null) {
          this.InitializeIdentificationTable();
        }
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
        if (this.BanksByVOB !== null) {
          this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
        }
        else {
          this.InitializeBankDetailsTable();
        }

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
    if (selectedType) {
      this.AddDynamicValidatorsIdentificationFormGroup(selectedType);
      if (selectedType.toLowerCase().includes('gst')) {
        this.identificationFormGroup.get('IDNumber').patchValue(this.StateCode);
      }
    }
  }
  AddIdentificationToTable(): void {
    if (this.identificationFormGroup.valid) {
      if (this.fileToUpload) {
        const bPIdentity = new BPIdentity();
        bPIdentity.Type = this.identificationFormGroup.get('Type').value;
        bPIdentity.IDNumber = this.identificationFormGroup.get('IDNumber').value;
        bPIdentity.Option = this.identificationFormGroup.get('Option').value;
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
          if (!this.IdentificationsByVOB || !this.IdentificationsByVOB.length || !this.IdentificationsByVOB[0].Type) {
            this.IdentificationsByVOB = [];
          }
          const dup = this.IdentificationsByVOB.filter(x => x.Type === bPIdentity.Type && x.IDNumber === bPIdentity.IDNumber)[0];
          if (!dup) {
            this.IdentificationsByVOB.push(bPIdentity);
            this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
            this.ClearIdentificationFormGroup();
          }

          else {
            this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
          }

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

      }
      else {
        this.notificationSnackBarComponent.openSnackBar(`Please select an attachment`, SnackBarStatus.danger, 5000);
      }
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

  // RemoveIdentificationFromTable(bPIdentity: BPIdentity): void {
  //   const index: number = this.IdentificationsByVOB.indexOf(bPIdentity);
  //   if (index > -1) {
  //     this.IdentificationsByVOB.splice(index, 1);
  //   }
  //   this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
  // }

  // RemoveBankFromTable(bPBank: BPBank): void {
  //   const index: number = this.BanksByVOB.indexOf(bPBank);
  //   if (index > -1) {
  //     this.BanksByVOB.splice(index, 1);
  //   }
  //   this.bankDetailsDataSource = new MatTableDataSource(this.BanksByVOB);
  // }

  // RemoveContactFromTable(bPContact: BPContact): void {
  //   const index: number = this.ContactsByVOB.indexOf(bPContact);
  //   if (index > -1) {
  //     this.ContactsByVOB.splice(index, 1);
  //   }
  //   this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
  // }

  // RemoveActivityLogFromTable(bPActivityLog: BPActivityLog): void {
  //   const index: number = this.ActivityLogsByVOB.indexOf(bPActivityLog);
  //   if (index > -1) {
  //     this.ActivityLogsByVOB.splice(index, 1);
  //   }
  //   this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
  // }

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
      this.index = null;
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
  InsertData(row: any): void {
    this.identificationFormGroup.get('Type').patchValue(row.Type);
    this.identificationFormGroup.get('IDNumber').patchValue(row.IDNumber);
    // this.identificationFormGroup.get('Type').patchValue(row.Type);
    // console.log('row', row);
  }
  AddIdentificationToTableDataSource(): void {
    const type = this.identificationFormGroup.get('Type').value;
    console.log('AddIdentificationToTableDataSource', type);
    console.log('AddIdentificationToTableDataSource', this.IdentificationsByVOB);
    for (let i = 0; this.IdentificationsByVOB.length; i++) {
      if (this.IdentificationsByVOB[i].Type === this.identificationFormGroup.get('Type').value) {
        // this.IdentificationsByVOB[i].Type = this.identificationFormGroup.get('Type').value;
        this.IdentificationsByVOB[i].IDNumber = this.identificationFormGroup.get('IDNumber').value;
        this.IdentificationsByVOB[i].AttachmentName = this.fileToUpload.name;
        this.fileToUploadList.push(this.fileToUpload);
        this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
        this.ClearIdentificationFormGroup();
        this.fileToUpload = null;
      }
    }
  }
  AddBankToTableDataSource(): void {
    console.log('Bank Data', this.bankDetailsDataSource);
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
          // if (dupli) {
          //   this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
          // }
          // else {
          //   console.log('Change data source', this.bankDetailsDataSource.data);
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].Name = this.bankDetailsFormGroup.get('Name').value;
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].IFSC = this.bankDetailsFormGroup.get('IFSC').value;
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].BankName = this.bankDetailsFormGroup.get('BankName').value;
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].Branch = this.bankDetailsFormGroup.get('Branch').value;
          //   this.bankDetailsDataSource.data[this.bankChangeIndex].City = this.bankDetailsFormGroup.get('City').value;
          // }
          if (this.bankChangeIndex !== null && this.bankChangeIndex >= 0) {
            console.log('Change data source', this.bankDetailsDataSource.data);
            this.bankDetailsDataSource.data[this.bankChangeIndex].AccountNo = this.bankDetailsFormGroup.get('AccountNo').value;
            this.bankDetailsDataSource.data[this.bankChangeIndex].Name = this.bankDetailsFormGroup.get('Name').value;
            this.bankDetailsDataSource.data[this.bankChangeIndex].IFSC = this.bankDetailsFormGroup.get('IFSC').value;
            this.bankDetailsDataSource.data[this.bankChangeIndex].BankName = this.bankDetailsFormGroup.get('BankName').value;
            this.bankDetailsDataSource.data[this.bankChangeIndex].Branch = this.bankDetailsFormGroup.get('Branch').value;
            this.bankDetailsDataSource.data[this.bankChangeIndex].City = this.bankDetailsFormGroup.get('City').value;
          }
          else {
            this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);

          }
        }

        this.ClearBankDetailsFormGroup();
      }
      else {
        this.notificationSnackBarComponent.openSnackBar(`Please select an attachment`, SnackBarStatus.danger, 5000);
      }
    } else {
      this.ShowValidationErrors(this.bankDetailsFormGroup);
    }
  }
  BankRowClicked(BankDetails: any, index: any): void {
    this.ClearBankDetailsFormGroup();
    this.fileToUpload1 = this.fileToUploadList[index];
    this.bankChangeIndex = index;
    console.log('Row:', this.bankDetailsFormGroup, 'Index:', index);
    this.bankDetailsFormGroup.get('AccountNo').patchValue(BankDetails.AccountNo);
    this.bankDetailsFormGroup.get('Name').patchValue(BankDetails.Name);
    this.bankDetailsFormGroup.get('IFSC').patchValue(BankDetails.IFSC);
    this.bankDetailsFormGroup.get('BankName').patchValue(BankDetails.BankName);
    this.bankDetailsFormGroup.get('Branch').patchValue(BankDetails.Branch);
    this.bankDetailsFormGroup.get('City').patchValue(BankDetails.City);

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
    // this.bankDetailsFormGroup.get('City').patchValue(Contactdetails.City);

  }
  ActivityClicked(activityDetails: any, index: any): void {
    this.ClearActivityLogFormGroup();
    this.activityIndex = index;
    console.log('Row:', this.activityLogFormGroup, 'Index:', index);
    this.activityLogFormGroup.get('Activity').patchValue(activityDetails.Activity);
    this.activityLogFormGroup.get('Date').patchValue(activityDetails.Date);
    this.activityLogFormGroup.get('Time').patchValue(activityDetails.Time);
    this.activityLogFormGroup.get('Text').patchValue(activityDetails.Text);
    // this.bankDetailsFormGroup.get('City').patchValue(Contactdetails.City);
  }
  AddActivityLogToTableDataSource(): void {
    if (this.activityLogFormGroup.valid) {
      const bPActivityLog = new BPActivityLog();
      bPActivityLog.Activity = this.activityLogFormGroup.get('Activity').value;
      bPActivityLog.Date = this.activityLogFormGroup.get('Date').value;
      bPActivityLog.Time = this.activityLogFormGroup.get('Time').value;
      bPActivityLog.Text = this.activityLogFormGroup.get('Text').value;
      if (!this.ActivityLogsByVOB || !this.ActivityLogsByVOB.length || !this.ActivityLogsByVOB[0].Activity) {
        this.ActivityLogsByVOB = [];
      }
      const duplicate = this.ActivityLogsByVOB.filter(x => x.Text === bPActivityLog.Text)[0];
      if (!duplicate) {
        this.ActivityLogsByVOB.push(bPActivityLog);
        this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
        this.ClearActivityLogFormGroup();
      }
      else {
        if (this.activityIndex !== null && this.activityIndex >= 0) {
          this.activityLogDataSource.data[this.activityIndex].Activity = this.activityLogFormGroup.get('Activity').value;
          this.activityLogDataSource.data[this.activityIndex].Date = this.activityLogFormGroup.get('Date').value;
          this.activityLogDataSource.data[this.activityIndex].Time = this.activityLogFormGroup.get('Time').value;
          this.activityLogDataSource.data[this.activityIndex].Text = this.activityLogFormGroup.get('Text').value;
          this.ClearActivityLogFormGroup();
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
        }
      }
      if (this.activityIndex >= 0) {
        this.activityLogDataSource.data[this.activityIndex].Activity = this.activityLogFormGroup.get('Activity').value;
        this.activityLogDataSource.data[this.activityIndex].Date = this.activityLogFormGroup.get('Date').value;
        this.activityLogDataSource.data[this.activityIndex].Time = this.activityLogFormGroup.get('Time').value;
        this.activityLogDataSource.data[this.activityIndex].Text = this.activityLogFormGroup.get('Text').value;
        this.ClearActivityLogFormGroup();
      }
      else {
        this.ActivityLogsByVOB.push(bPActivityLog);
        this.activityLogDataSource = new MatTableDataSource(this.ActivityLogsByVOB);
        this.ClearActivityLogFormGroup();
      }
    } else {
      this.ShowValidationErrors(this.activityLogFormGroup);
    }
  }
  AddContactToTableDataSource(): void {
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
        if (this.contactDetailsIndex !== null && this.contactDetailsIndex >= 0) {
          this.contactDataSource.data[this.contactDetailsIndex].Name = this.contactFormGroup.get('Name').value;
          this.contactDataSource.data[this.contactDetailsIndex].Department = this.contactFormGroup.get('Department').value;
          this.contactDataSource.data[this.contactDetailsIndex].Title = this.contactFormGroup.get('Title').value;
          this.contactDataSource.data[this.contactDetailsIndex].Mobile = this.contactFormGroup.get('Mobile').value;
          this.contactDataSource.data[this.contactDetailsIndex].Email = this.contactFormGroup.get('Email').value;
          this.ClearContactFormGroup();
        }
        else {
          this.notificationSnackBarComponent.openSnackBar(`Duplicate record`, SnackBarStatus.danger, 5000);
        }
      }
      // if (this.contactDetailsIndex !== null && this.contactDetailsIndex >= 0) {
      //   this.contactDataSource.data[this.contactDetailsIndex].Name = this.contactFormGroup.get('Name').value;
      //   this.contactDataSource.data[this.contactDetailsIndex].Department = this.contactFormGroup.get('Department').value;
      //   this.contactDataSource.data[this.contactDetailsIndex].Title = this.contactFormGroup.get('Title').value;
      //   this.contactDataSource.data[this.contactDetailsIndex].Mobile = this.contactFormGroup.get('Mobile').value;
      //   this.contactDataSource.data[this.contactDetailsIndex].Email = this.contactFormGroup.get('Email').value;
      //   this.ClearContactFormGroup();
      // }
      // else {
      //   this.ContactsByVOB.push(bPContact);
      //   this.contactDataSource = new MatTableDataSource(this.ContactsByVOB);
      //   this.ClearContactFormGroup();
      // }
    }
    else {
      this.ShowValidationErrors(this.contactFormGroup);
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
            this.CreateVendorOnBoarding();
          } else if (Actiontype === 'Update') {
            this.UpdateVendorOnBoarding();
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
    this.SelectedBPVendorOnBoarding.Invoice = this.SelectedBPVendorOnBoardingView.Invoice = this.vendorRegistrationFormGroup.get('Invoice').value;
    this.SelectedBPVendorOnBoarding.WebsiteAddress = this.SelectedBPVendorOnBoardingView.WebsiteAddress = this.vendorRegistrationFormGroup.get('WebsiteAddress').value;
    // this.SelectedBPVendorOnBoarding.VendorCode = this.SelectedBPVendorOnBoardingView.VendorCode = this.vendorRegistrationFormGroup.get('VendorCode').value;
    // this.SelectedBPVendorOnBoarding.ParentVendor = this.SelectedBPVendorOnBoardingView.ParentVendor = this.vendorRegistrationFormGroup.get('ParentVendor').value;
    // this.SelectedBPVendorOnBoarding.Status = this.SelectedBPVendorOnBoardingView.Status = this.vendorRegistrationFormGroup.get('Status').value;
    this.SelectedBPVendorOnBoarding.Field1 = this.SelectedBPVendorOnBoardingView.Field1 = this.vendorRegistrationFormGroup.get('Field1').value;
    this.SelectedBPVendorOnBoarding.Field2 = this.SelectedBPVendorOnBoardingView.Field2 = this.vendorRegistrationFormGroup.get('Field2').value;
    this.SelectedBPVendorOnBoarding.Field3 = this.SelectedBPVendorOnBoardingView.Field3 = this.vendorRegistrationFormGroup.get('Field3').value;
    this.SelectedBPVendorOnBoarding.Field4 = this.SelectedBPVendorOnBoardingView.Field4 = this.vendorRegistrationFormGroup.get('Field4').value;
    this.SelectedBPVendorOnBoarding.Field5 = this.SelectedBPVendorOnBoardingView.Field5 = this.vendorRegistrationFormGroup.get('Field5').value;
    this.SelectedBPVendorOnBoarding.Field6 = this.SelectedBPVendorOnBoardingView.Field6 = this.vendorRegistrationFormGroup.get('Field6').value;
    this.SelectedBPVendorOnBoarding.Field7 = this.SelectedBPVendorOnBoardingView.Field7 = this.vendorRegistrationFormGroup.get('Field7').value;
    this.SelectedBPVendorOnBoarding.Field8 = this.SelectedBPVendorOnBoardingView.Field8 = this.vendorRegistrationFormGroup.get('Field8').value;
    this.SelectedBPVendorOnBoarding.Field9 = this.SelectedBPVendorOnBoardingView.Field9 = this.vendorRegistrationFormGroup.get('Field9').value;
    this.SelectedBPVendorOnBoarding.Field10 = this.SelectedBPVendorOnBoardingView.Field10 = this.vendorRegistrationFormGroup.get('Field10').value;

  }

  GetBPVendorOnBoardingSubItemValues(): void {
    this.GetBPIdentityValues();
    this.GetBPBankValues();
    this.GetBPContactValues();
    // this.GetBPActivityLogValues();
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
      ans.AppID = this.AllQuestionAnswersView[i].AppID;
      ans.AppUID = this.AllQuestionAnswersView[i].AppUID;
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


  CreateVendorOnBoarding(): void {
    // this.GetBPVendorOnBoardingValues();
    // this.GetBPVendorOnBoardingSubItemValues();
    // this.SelectedBPVendorOnBoardingView.CreatedBy = this.authenticationDetails.userID.toString();
    const vendorUser: VendorUser = new VendorUser();
    vendorUser.Email = this.SelectedBPVendorOnBoardingView.Email1;
    vendorUser.Phone = this.SelectedBPVendorOnBoardingView.Phone1;
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.CreateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        this.SelectedBPVendorOnBoarding.TransID = +(data as BPVendorOnBoarding).TransID;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this._vendorRegistrationService.AddUserAttachment(this.SelectedBPVendorOnBoarding.TransID, this.SelectedBPVendorOnBoarding.Email1, this.fileToUploadList[0]).subscribe(
            () => {
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
    this.SelectedBPVendorOnBoardingView.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.SelectedBPVendorOnBoardingView.Status = 'Open';
    this.IsProgressBarVisibile = true;
    this._vendorRegistrationService.UpdateVendorOnBoarding(this.SelectedBPVendorOnBoardingView).subscribe(
      (data) => {
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this._vendorRegistrationService.AddUserAttachment(this.SelectedBPVendorOnBoarding.TransID, this.SelectedBPVendorOnBoarding.Email1, this.fileToUploadList[0]).subscribe(
            () => {
              this.GetQuestionsAnswers(this.CurrentUserID);
              this._vendorRegistrationService.SaveAnswers(this.answerList).subscribe(
                () => {
                  this.ResetControl();
                  this.notificationSnackBarComponent.openSnackBar('Vendor updated successfully', SnackBarStatus.success);
                  this.IsProgressBarVisibile = false;
                  this.GetVendorOnBoardingsByEmailID();
                  // this.GetQuestionAnswers();
                },
                (err) => {
                  this.showErrorNotificationSnackBar(err);
                });
              // this._router.navigate(['/auth/login']);
            },
            (err) => {
              this.showErrorNotificationSnackBar(err);
            });
        } else {
          this.GetQuestionsAnswers(this.CurrentUserID);
          this._vendorRegistrationService.SaveAnswers(this.answerList).subscribe(
            () => {
              this.ResetControl();
              this.notificationSnackBarComponent.openSnackBar('Vendor updated successfully', SnackBarStatus.success);
              this.IsProgressBarVisibile = false;
              this.GetVendorOnBoardingsByEmailID();
              // this.GetQuestionAnswers();
            },
            (err) => {
              this.showErrorNotificationSnackBar(err);
            });
        }
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

  SaveClicked(): void {
    if (this.vendorRegistrationFormGroup.valid) {
      // const file: File = this.fileToUpload;
      this.GetBPVendorOnBoardingValues();
      this.GetBPVendorOnBoardingSubItemValues();
      // if (choice.toLowerCase() === 'sumbit') {
      //   if (this.IdentificationsByVOB.length > 0 && this.BanksByVOB.length > 0 && this.ContactsByVOB.length > 0) {
      //     this.SetActionToOpenConfirmation();
      //   }
      //   else {
      //     this.notificationSnackBarComponent.openSnackBar('Please add atleast one record for BPIdentity,BPBank,BPContact table', SnackBarStatus.danger);
      //   }
      // }
      // else {
      //   this.SetActionToOpenConfirmation();
      // }
      this.SetActionToOpenConfirmation();
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

  SetActionToOpenConfirmation(): void {
    if (this.SelectedBPVendorOnBoarding.TransID) {
      const Actiontype = 'Update';
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      const Actiontype = 'Register';
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
      // evt.target.files[0] = null;
      if (this.SelectedIdentity && this.SelectedIdentity.Type) {
        const selectFileName = this.SelectedIdentity.AttachmentName;
        const indexx = this.IdentificationsByVOB.findIndex(x => x.Type === this.SelectedIdentity.Type && x.IDNumber === this.SelectedIdentity.IDNumber);
        if (indexx > -1) {
          this.IdentificationsByVOB[indexx].AttachmentName = this.fileToUpload.name;
          this.identificationDataSource = new MatTableDataSource(this.IdentificationsByVOB);
          this.fileToUploadList.push(this.fileToUpload);
          if (selectFileName) {
            const fileIndex = this.fileToUploadList.findIndex(x => x.name === selectFileName);
            if (fileIndex > -1) {
              this.fileToUploadList.splice(fileIndex, 1);
            }
          }
          this.fileToUpload = null;
        }
        this.SelectedIdentity = new BPIdentity();
      }
      // this.fileToUploadList.push(this.fileToUpload);
    }
  }
  handleFileInput2(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload1 = evt.target.files[0];
      // evt.target.files[0] = null;
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
      this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.GetIdentityAttachment(element.Type, element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
            const blob = new Blob([data], { type: fileType });
            this.OpenAttachmentDialog(fileName, blob);
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
      this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._vendorRegistrationService.GetIdentityAttachment(element.AccountNo, element.TransID.toString(), fileName).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
            const blob = new Blob([data], { type: fileType });
            this.OpenAttachmentDialog(fileName, blob);
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
              //  this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^[0-9]{2,5}([- ]*)[0-9]{6,8}$')]);
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
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(10)]);
            }
            else {
              this.vendorRegistrationFormGroup.get(key).setValidators(Validators.required);
            }
            this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
          } else {
            if (key === 'Phone1') {
              //  this.vendorRegistrationFormGroup.get(key).setValidators([Validators.pattern('^[0-9]{2,5}([- ]*)[0-9]{6,8}$')]);
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
              this.vendorRegistrationFormGroup.get(key).setValidators([Validators.minLength(6), Validators.maxLength(10)]);
            }
            else {
              this.vendorRegistrationFormGroup.get(key).clearValidators();
            }
            this.vendorRegistrationFormGroup.get(key).updateValueAndValidity();
          }
          // this.vendorRegistrationFormGroup.get('Role').disable;
          // this.vendorRegistrationFormGroup.get('Type').disable;

        }
      }
    });
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