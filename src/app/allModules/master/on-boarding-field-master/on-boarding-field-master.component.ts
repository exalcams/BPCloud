import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { CBPFieldMaster } from 'app/models/vendor-master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { VendorMasterService } from 'app/services/vendor-master.service';

@Component({
  selector: 'app-on-boarding-field-master',
  templateUrl: './on-boarding-field-master.component.html',
  styleUrls: ['./on-boarding-field-master.component.scss']
})
export class OnBoardingFieldMasterComponent implements OnInit {

  AllOnBoardingFieldMasters: CBPFieldMaster[] = [];
  AllExtensions: string[] = [];
  MandatoryList: any[] = [];
  selectedOnBoardingFieldMaster: CBPFieldMaster;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: number;
  OnBoardingFieldMasterFormGroup: FormGroup;
  searchText = '';
  constructor(
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.selectedOnBoardingFieldMaster = new CBPFieldMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('OBD Field Master') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeOnBoardingFieldMasterFormGroup();
      this.InitializeMandatoryList();
      this.GetAllOnBoardingFieldMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  InitializeOnBoardingFieldMasterFormGroup(): void {
    this.OnBoardingFieldMasterFormGroup = this._formBuilder.group({
      Field: ['', Validators.required],
      Text: ['', Validators.required],
      DefaultValue: [''],
      Mandatory: ['', [Validators.required]],
      Invisible: ['', [Validators.required]],
    });
    this.OnBoardingFieldMasterFormGroup.get('Field').disable();
  }

  ResetControl(): void {
    this.selectedOnBoardingFieldMaster = new CBPFieldMaster();
    this.selectID = 0;
    this.OnBoardingFieldMasterFormGroup.reset();
    Object.keys(this.OnBoardingFieldMasterFormGroup.controls).forEach(key => {
      this.OnBoardingFieldMasterFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  InitializeAllExtensions(): void {
    this.AllExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'];
  }
  InitializeMandatoryList(): void {
    this.MandatoryList = [{ Key: 'Yes', Value: true }, { Key: 'No', Value: false }];
  }
  GetAllOnBoardingFieldMasters(): void {
    this.isProgressBarVisibile = true;
    this._vendorMasterService.GetAllOnBoardingFieldMaster().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllOnBoardingFieldMasters = <CBPFieldMaster[]>data;
        if (this.AllOnBoardingFieldMasters && this.AllOnBoardingFieldMasters.length) {
          this.loadSelectedOnBoardingFieldMaster(this.AllOnBoardingFieldMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedOnBoardingFieldMaster(selectedOnBoardingFieldMaster: CBPFieldMaster): void {
    this.selectID = selectedOnBoardingFieldMaster.ID;
    this.selectedOnBoardingFieldMaster = selectedOnBoardingFieldMaster;
    this.SetOnBoardingFieldMasterValues();
  }

  SetOnBoardingFieldMasterValues(): void {
    this.OnBoardingFieldMasterFormGroup.get('Field').patchValue(this.selectedOnBoardingFieldMaster.Field);
    this.OnBoardingFieldMasterFormGroup.get('Text').patchValue(this.selectedOnBoardingFieldMaster.Text);
    this.OnBoardingFieldMasterFormGroup.get('DefaultValue').patchValue(this.selectedOnBoardingFieldMaster.DefaultValue);
    this.OnBoardingFieldMasterFormGroup.get('Mandatory').patchValue(this.selectedOnBoardingFieldMaster.Mandatory);
    this.OnBoardingFieldMasterFormGroup.get('Invisible').patchValue(this.selectedOnBoardingFieldMaster.Invisible);
    this.OnBoardingFieldMasterFormGroup.get('Field').disable();
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
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
          if (Actiontype === 'Create') {
            // this.CreateOnBoardingFieldMaster();
          } else if (Actiontype === 'Update') {
            this.UpdateOnBoardingFieldMaster();
          } else if (Actiontype === 'Delete') {
            // this.DeleteOnBoardingFieldMaster();
          }
        }
      });
  }

  GetOnBoardingFieldMasterValues(): void {
    this.selectedOnBoardingFieldMaster.Field = this.OnBoardingFieldMasterFormGroup.get('Field').value;
    this.selectedOnBoardingFieldMaster.FieldName = this.OnBoardingFieldMasterFormGroup.get('Field').value;
    this.selectedOnBoardingFieldMaster.Text = this.OnBoardingFieldMasterFormGroup.get('Text').value;
    this.selectedOnBoardingFieldMaster.DefaultValue = this.OnBoardingFieldMasterFormGroup.get('DefaultValue').value;
    this.selectedOnBoardingFieldMaster.Mandatory = this.OnBoardingFieldMasterFormGroup.get('Mandatory').value;
    this.selectedOnBoardingFieldMaster.Invisible = this.OnBoardingFieldMasterFormGroup.get('Invisible').value;
  }

  // CreateOnBoardingFieldMaster(): void {
  //   this.GetOnBoardingFieldMasterValues();
  //   this.selectedOnBoardingFieldMaster.CreatedBy = this.authenticationDetails.UserID.toString();
  //   this.isProgressBarVisibile = true;
  //   this._masterService.CreateOnBoardingFieldMaster(this.selectedOnBoardingFieldMaster).subscribe(
  //     (data) => {
  //       // console.log(data);
  //       this.ResetControl();
  //       this.notificationSnackBarComponent.openSnackBar('Document Type Master created successfully', SnackBarStatus.success);
  //       this.isProgressBarVisibile = false;
  //       this.GetAllOnBoardingFieldMasters();
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );

  // }

  UpdateOnBoardingFieldMaster(): void {
    this.GetOnBoardingFieldMasterValues();
    this.selectedOnBoardingFieldMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._vendorMasterService.UpdateOnBoardingFieldMaster(this.selectedOnBoardingFieldMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('OnBoarding Field Configuration updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllOnBoardingFieldMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // DeleteOnBoardingFieldMaster(): void {
  //   this.GetOnBoardingFieldMasterValues();
  //   this.selectedOnBoardingFieldMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
  //   this.isProgressBarVisibile = true;
  //   this._masterService.DeleteOnBoardingFieldMaster(this.selectedOnBoardingFieldMaster).subscribe(
  //     (data) => {
  //       // console.log(data);
  //       this.ResetControl();
  //       this.notificationSnackBarComponent.openSnackBar('Document Type Master deleted successfully', SnackBarStatus.success);
  //       this.isProgressBarVisibile = false;
  //       this.GetAllOnBoardingFieldMasters();
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  ShowValidationErrors(): void {
    Object.keys(this.OnBoardingFieldMasterFormGroup.controls).forEach(key => {
      this.OnBoardingFieldMasterFormGroup.get(key).markAsTouched();
      this.OnBoardingFieldMasterFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.OnBoardingFieldMasterFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedOnBoardingFieldMaster.ID) {
        const Actiontype = 'Update';
        const Catagory = 'Document type Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Document type Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  // DeleteClicked(): void {
  //   if (this.OnBoardingFieldMasterFormGroup.valid) {
  //     if (this.selectedOnBoardingFieldMaster.ID) {
  //       const Actiontype = 'Delete';
  //       const Catagory = 'Document type Master';
  //       this.OpenConfirmationDialog(Actiontype, Catagory);
  //     }
  //   } else {
  //     this.ShowValidationErrors();
  //   }
  // }


}
