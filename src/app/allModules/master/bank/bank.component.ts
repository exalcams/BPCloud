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
import { CBPBank, CBPBankView } from 'app/models/vendor-master';
import { VendorMasterService } from 'app/services/vendor-master.service';
export interface BankCountry {
    CountryCode: string;
    CountryName: string;
}
@Component({
    selector: 'app-bank',
    templateUrl: './bank.component.html',
    styleUrls: ['./bank.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class BankComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    selection = new SelectionModel<any>(true, []);
    searchText = '';
    IsProgressBarVisibile: boolean;
    MenuItems: string[];
    AllUserWithRoles: UserWithRole[] = [];
    AllBanks: CBPBank[] = [];
    BankFormGroup: FormGroup;
    SelectedBank: CBPBank;
    SelectedBankCode: string;
    SelectedBankView: CBPBankView;
    AllCountries: BankCountry[] = [];

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
        this.SelectedBank = new CBPBank();
        this.SelectedBankView = new CBPBankView();
        this.SelectedBankCode = '';
        this.AllCountries = [{
            'CountryCode': '20',
            'CountryName': 'India'
        }];
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
            // if (this.MenuItems.indexOf('Bank') < 0) {
            //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
            //     );
            //     this._router.navigate(['/auth/login']);
            // }

        } else {
            this._router.navigate(['/auth/login']);
        }
        this.InitializeBankFormGroup();
        this.GetAllBanks();
    }

    InitializeBankFormGroup(): void {
        this.BankFormGroup = this._formBuilder.group({
            BankCode: ['', Validators.required],
            BankName: ['', Validators.required],
            BankCity: ['', Validators.required],
            // ExpDateReq: [new Date(), Validators.required],
            BankCountry: ['', Validators.required],
            BankBranch: [''],
            pincode:['']
        });
    }

    ResetControl(): void {
        this.SelectedBank = new CBPBank();
        this.SelectedBankView = new CBPBankView();
        this.SelectedBankCode = '';
        this.ResetBankFormGroup();
    }

    ResetBankFormGroup(): void {
        this.ResetFormGroup(this.BankFormGroup);
    }

    ResetFormGroup(formGroup: FormGroup): void {
        formGroup.reset();
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.get(key).enable();
            formGroup.get(key).markAsUntouched();
        });
    }

    GetAllBanks(): void {
        this._vendorMasterService.GetAllBanks().subscribe(
            (data) => {
                this.AllBanks = data as CBPBank[];
                if (this.AllBanks && this.AllBanks.length) {
                    this.LoadSelectedBank(this.AllBanks[0]);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    LoadSelectedBank(seletedBank: CBPBank): void {
        this.SelectedBank = seletedBank;
        this.SelectedBankView.BankCode = this.SelectedBank.BankCode;
        this.SelectedBankCode = this.SelectedBank.BankCode;
        this.SetBankValues();
    }

    SetBankValues(): void {

        this.BankFormGroup.get('BankCode').patchValue(this.SelectedBank.BankCode);
        this.BankFormGroup.get('BankName').patchValue(this.SelectedBank.BankName);
        this.BankFormGroup.get('BankCity').patchValue(this.SelectedBank.BankCity);
        // this.BankFormGroup.get('ExpDateReq').patchValue(this.SelectedBank.ExpDateReq);
        this.BankFormGroup.get('BankCountry').patchValue(this.SelectedBank.BankCountry);
        this.BankFormGroup.get('BankBranch').patchValue(this.SelectedBank.BankBranch);
        this.BankFormGroup.get('pincode').patchValue(this.SelectedBank.BankBranch);
    }

    GetBankValues(): void {

        this.SelectedBank.BankCode = this.SelectedBankView.BankCode = this.BankFormGroup.get('BankCode').value;
        this.SelectedBank.BankName = this.SelectedBankView.BankName = this.BankFormGroup.get('BankName').value;
        this.SelectedBank.BankCity = this.SelectedBankView.BankCity = this.BankFormGroup.get('BankCity').value;
        // this.SelectedBank.ExpDateReq = this.SelectedBankView.ExpDateReq = this.BankFormGroup.get('ExpDateReq').value;
        this.SelectedBank.BankCountry = this.SelectedBankView.BankCountry = this.BankFormGroup.get('BankCountry').value;
        this.SelectedBank.BankBranch = this.SelectedBankView.BankBranch = this.BankFormGroup.get('BankBranch').value;
        this.SelectedBank.BankBranch = this.SelectedBankView.BankBranch = this.BankFormGroup.get('pincode').value;
    }

    SaveClicked(): void {
        if (this.BankFormGroup.valid) {
            this.GetBankValues();
            this.SetActionToOpenConfirmation('Save');
        } else {
            this.ShowValidationErrors(this.BankFormGroup);
        }
    }

    UpdateClicked(): void {
        if (this.BankFormGroup.valid) {
            this.GetBankValues();
            this.SetActionToOpenConfirmation('Update');
        } else {
            this.ShowValidationErrors(this.BankFormGroup);
        }
    }

    DeleteClicked(): void {
        if (this.SelectedBank.BankCode) {
            const Actiontype = 'Delete';
            const Catagory = 'Bank';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }

    SetActionToOpenConfirmation(Actiontype: string): void {
        const Catagory = 'Bank';
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
                    if (Actiontype === 'Save') {
                        this.CreateBank(Actiontype);
                    }
                    else if (Actiontype === 'Update') {
                        if (this.SelectedBank.BankCode) {
                            this.UpdateBank(Actiontype);
                        }
                    } else if (Actiontype === 'Delete') {
                        this.DeleteBank();
                    }
                }
            });
    }

    CreateBank(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.CreateBank(this.SelectedBankView).subscribe(
            (data) => {
                // this.SelectedBank.BankCode = (data as CBPBank).BankCode;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`Bank ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllBanks();
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            }
        );
    }

    UpdateBank(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.UpdateBank(this.SelectedBankView).subscribe(
            (data) => {
                // this.SelectedBank.BankCode = (data as CBPBank).BankCode;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`Bank ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllBanks();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    DeleteBank(): void {
        this.GetBankValues();
        this.IsProgressBarVisibile = true;
        this._vendorMasterService.DeleteBank(this.SelectedBank).subscribe(
            (data) => {
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('Bank deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetAllBanks();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    CountrySelected(): void {

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

