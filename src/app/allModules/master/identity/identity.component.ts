import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthenticationDetails, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { FuseConfigService } from '@fuse/services/config.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { DatePipe } from '@angular/common';
import { CBPIdentity, CBPIdentityView } from 'app/models/vendor-master';
import { VendorMasterService } from 'app/services/vendor-master.service';
export interface Country {
    CountryCode: string;
    CountryName: string;
}
@Component({
    selector: 'app-identity',
    templateUrl: './identity.component.html',
    styleUrls: ['./identity.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class IdentityComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    selection = new SelectionModel<any>(true, []);
    searchText = '';
    IsProgressBarVisibile: boolean;
    MenuItems: string[];
    AllDOC: any[] = [];
    AllUserWithRoles: UserWithRole[] = [];
    AllIdentitities: CBPIdentity[] = [];
    IdentityFormGroup: FormGroup;
    SelectedIdentity: CBPIdentity;
    SelectedIdentityID: number;
    SelectedIdentityView: CBPIdentityView;
    AllCountries: any[] = [];
    Format:any[]=[];
    buttonhidden:boolean=true;

    constructor(
        private _masterService: MasterService,
        private _vendorMasterService: VendorMasterService,
        private _datePipe: DatePipe,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder) {
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = false;
        this.SelectedIdentity = new CBPIdentity();
        this.SelectedIdentityView = new CBPIdentityView();
        this.SelectedIdentityID = 0;
        this.AllCountries = [ { name: 'India', code: 'IN',countrycode:'+91' },];
        this.Format=['.Doc',
            '.Txt',
            '.PDF',
            '.XLS or .XLSX'];
            this.AllDOC = [
                { Key: 'Yes', Value: '1' },
                { Key: 'No', Value: '2' }
              ];
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserName = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
            // if (this.MenuItems.indexOf('Identity') < 0) {
            //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
            //     );
            //     this._router.navigate(['/auth/login']);
            // }

        } else {
            this._router.navigate(['/auth/login']);
        }
        this.InitializeIdentityFormGroup();
        this.GetAllIdentities();
    }
    TypeSelected(event): void {
        if (event.value) {
          const selecteType = event.value as string;
          if (selecteType && selecteType === '1') {
              this.IdentityFormGroup.get('ExpDateReq').enable();

          }else{
            this.IdentityFormGroup.get('ExpDateReq').disable();
          }
        }
    }

    InitializeIdentityFormGroup(): void {
        this.IdentityFormGroup = this._formBuilder.group({
            Text: ['', Validators.required],
            Format: ['', Validators.required],
            ExpDateReq: [new Date(), Validators.required],
            Country: ['IND', Validators.required],
            DocReq: [''],
        });
        this.IdentityFormGroup.get('ExpDateReq').disable();
    }

    ResetControl(): void {
        this.SelectedIdentity = new CBPIdentity();
        this.SelectedIdentityView = new CBPIdentityView();
        this.SelectedIdentityID = 0;
        this.ResetIdentityFormGroup();
        this.buttonhidden=false;
        this.IdentityFormGroup.get('ExpDateReq').disable();
    }

    ResetIdentityFormGroup(): void {
        this.ResetFormGroup(this.IdentityFormGroup);
    }

    ResetFormGroup(formGroup: FormGroup): void {
        formGroup.reset();
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.get(key).enable();
            formGroup.get(key).markAsUntouched();
        });
    }

    GetAllIdentities(): void {
        this._vendorMasterService.GetAllIdentities().subscribe(
            (data) => {
                this.AllIdentitities = data as CBPIdentity[];
                if (this.AllIdentitities && this.AllIdentitities.length) {
                    this.LoadSelectedIdentity(this.AllIdentitities[0]);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    LoadSelectedIdentity(seletedIdentity: CBPIdentity): void {
        this.SelectedIdentity = seletedIdentity;
        this.SelectedIdentityView.ID = this.SelectedIdentity.ID;
        this.SelectedIdentityID = this.SelectedIdentity.ID;
        this.SetIdentityValues();
    }

    SetIdentityValues(): void {
        this.IdentityFormGroup.get('Text').patchValue(this.SelectedIdentity.Text);
        this.IdentityFormGroup.get('Format').patchValue(this.SelectedIdentity.Format);
        this.IdentityFormGroup.get('ExpDateReq').patchValue(this.SelectedIdentity.ExpDateReq);
        this.IdentityFormGroup.get('Country').patchValue(this.SelectedIdentity.Country);
        this.IdentityFormGroup.get('DocReq').patchValue(this.SelectedIdentity.DocReq);
    }

    GetIdentityValues(): void {
        this.SelectedIdentity.Text = this.SelectedIdentityView.Text = this.IdentityFormGroup.get('Text').value;
        this.SelectedIdentity.Format = this.SelectedIdentityView.Format = this.IdentityFormGroup.get('Format').value;
        this.SelectedIdentity.ExpDateReq = this.SelectedIdentityView.ExpDateReq = this.IdentityFormGroup.get('ExpDateReq').value;
        this.SelectedIdentity.Country = this.SelectedIdentityView.Country = this.IdentityFormGroup.get('Country').value;
        this.SelectedIdentity.DocReq = this.SelectedIdentityView.DocReq = this.IdentityFormGroup.get('DocReq').value;
    }

    SaveClicked(): void {
        if (this.IdentityFormGroup.valid) {
            this.GetIdentityValues();
            this.SetActionToOpenConfirmation('Save');
            this.buttonhidden=true;
        } else {
            this.ShowValidationErrors(this.IdentityFormGroup);
        }
    }

    UpdateClicked(): void {
        if (this.IdentityFormGroup.valid) {
            this.GetIdentityValues();
            this.SetActionToOpenConfirmation('Update');
        } else {
            this.ShowValidationErrors(this.IdentityFormGroup);
        }
    }

    DeleteClicked(): void {
        if (this.SelectedIdentity.ID) {
            const Actiontype = 'Delete';
            const Catagory = 'Identity';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }

    SetActionToOpenConfirmation(Actiontype: string): void {
        const Catagory = 'Identity';
        this.OpenConfirmationDialog(Actiontype, Catagory);
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
                    if (Actiontype === 'Save' || Actiontype === 'Update') {
                        if (this.SelectedIdentity.ID) {
                            this.UpdateIdentity(Actiontype);
                            this.buttonhidden=true;
                        } else {
                            this.CreateIdentity(Actiontype);
                        }
                    } else if (Actiontype === 'Delete') {
                        this.DeleteIdentity();
                        this.buttonhidden=true;
                    }
                }
            });
    }

    CreateIdentity(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.CreateIdentity(this.SelectedIdentityView).subscribe(
            (data) => {
                this.SelectedIdentity.ID = (data as CBPIdentity).ID;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`Identity ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.buttonhidden=true;
                this.GetAllIdentities();
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            }
        );
    }

    UpdateIdentity(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.UpdateIdentity(this.SelectedIdentityView).subscribe(
            (data) => {
                this.SelectedIdentity.ID = (data as CBPIdentity).ID;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`Identity ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.buttonhidden=true;
                this.GetAllIdentities();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    DeleteIdentity(): void {
        this.GetIdentityValues();
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.DeleteIdentity(this.SelectedIdentity).subscribe(
            (data) => {
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('Identity deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.buttonhidden=true;
                this.GetAllIdentities();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    CountrySelected(event): void {
        if (event.value) {
            const selecteType = event.value as string;
            if (selecteType && selecteType === 'India') {
        
        }
    }

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

    showErrorNotificationSnackBar(err: any): void {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
    }

    calculateDiff(sentDate): number {
        const dateSent: Date = new Date(sentDate);
        const currentDate: Date = new Date();
        return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
            Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    }

    decimalOnly(event): boolean {
        // this.AmountSelected();
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

}

