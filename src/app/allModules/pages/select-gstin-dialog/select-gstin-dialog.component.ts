import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CustomValidator } from 'app/shared/custom-validator';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { VendorMasterService } from 'app/services/vendor-master.service';
@Component({
  selector: 'select-gstin-dialog',
  templateUrl: './select-gstin-dialog.component.html',
  styleUrls: ['./select-gstin-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SelectGstinDialogComponent implements OnInit {
  selectGstinForm: FormGroup;
  selectedGstin: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<SelectGstinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private _vendorMasterService: VendorMasterService,

  ) {
    this.selectGstinForm = this._formBuilder.group({
      // tslint:disable-next-line:max-line-length
      Gstin: ['', [Validators.required, Validators.pattern('^([0]{1}[1-9]{1}|[1-2]{1}[0-9]{1}|[3]{1}[0-7]{1})([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$')]],
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {

  }

  YesClicked(): void {
    if (this.selectGstinForm.valid) {
      this.selectedGstin = this.selectGstinForm.get('Gstin').value;
      if (!this.selectedGstin) {
        this.notificationSnackBarComponent.openSnackBar('gstin cannot be empty', SnackBarStatus.danger);
      } else {
        this.matDialogRef.close(this.selectedGstin);
      }
    } else {
      Object.keys(this.selectGstinForm.controls).forEach(key => {
        this.selectGstinForm.get(key).markAsTouched();
        this.selectGstinForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    this.matDialogRef.close(null);

  }

}
