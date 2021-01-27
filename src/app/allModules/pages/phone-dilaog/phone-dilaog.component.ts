import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'app-phone-dilaog',
  templateUrl: './phone-dilaog.component.html',
  styleUrls: ['./phone-dilaog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PhoneDilaogComponent implements OnInit {
  selectedGame:any;
  // @Input() selectedGame1:any;
  constructor(public dialogRef: MatDialogRef<PhoneDilaogComponent>,) { }

  ngOnInit() {
  }
  select_mob(event){
    console.log("event"+event.value)
this.selectedGame=event.value
  }
  confrimClicked(){
    console.log("selected"+this.selectedGame)
    this.dialogRef.close(this.selectedGame);
  }
  // CloseClicked(): void {
  //   this.dialogRef.close(null);

  // }
}
