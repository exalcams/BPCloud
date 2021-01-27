import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogData } from './dialog-data';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, Validators } from '@angular/forms';
import { SnackBarStatus } from '../notification-snack-bar/notification-snackbar-status-enum';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
import { BPVendorOnBoarding } from 'app/models/vendor-registration';

@Component({
  selector: 'notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class NotificationDialogComponent implements OnInit {
  // public dialogData: DialogData;
  hiddeninput:Boolean;
  // this.hiddeninput=false;
  RemarkFormGroup: FormGroup;
  private _formBuilder: any;
  Remarkss:BPVendorOnBoarding;
  Remarks='';
  private _vendorRegistrationService: VendorRegistrationService;
  notificationSnackBarComponent: any;
  IsProgressBarVisibile: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
  ) {
    if (dialogData.Actiontype === "Reject") {
      this.hiddeninput=true;
      
    }

  }
  

  ngOnInit(): void {
    

  }
  handleFileInput1(event:any){
    this.Remarks=event.target.value;
  }
  YesClicked(): void {
    
       

    this.dialogRef.close(true);
    this._vendorRegistrationService.RejectVendor(this.Remarkss).subscribe(
      () => {
        this.handleFileInput1(event);
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  CloseClicked(): void {
    this.dialogRef.close(false);
  }
  InitializeRemarkFormGroup():void{
    this.RemarkFormGroup = this._formBuilder.group({
      Remark:['', Validators.required]
    });
  }

}
