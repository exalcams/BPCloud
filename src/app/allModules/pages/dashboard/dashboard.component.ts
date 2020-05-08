import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthenticationDetails, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FormBuilder } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { BPVendorOnBoarding } from 'app/models/vendor-registration';
import { DashboardService } from 'app/services/dashboard.service';
import { VendorRegistrationService } from 'app/services/vendor-registration.service';
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DashboardComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    MenuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    AllUserWithRoles: UserWithRole[] = [];
    VendorOnBoardingsDisplayedColumns: string[] = [
        'TransID',
        'Name',
        'LegalName',
        'Type',
        'Country',
        'Phone1',
        'Email1',
        'CreatedOn',
        'Action'
    ];
    VendorOnBoardingsDataSource: MatTableDataSource<BPVendorOnBoarding>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    selection = new SelectionModel<any>(true, []);
    AllTickets: any[] = [];
    AllActivities: any[] = [];
    Fulfilments: any[] = [];
    DeliveryStatus: any[] = [];
    searchText = '';
    FilterVal = 'All';
    ActionModel = 'Actions';
    AllVendorOnBoardings: BPVendorOnBoarding[] = [];

    constructor(
        public snackBar: MatSnackBar,
        private _router: Router,
        public dialog: MatDialog,
        private _masterService: MasterService,
        private _dashboardService: DashboardService,
        private _vendorRegistrationService: VendorRegistrationService) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = false;
    }
    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
            if (this.MenuItems.indexOf('Admin Dashboard') < 0) {
                this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
                );
                this._router.navigate(['/auth/login']);
            }
            this.GetAllVendorOnBoardings();
            this.GetAllUserWithRoles();

        } else {
            this._router.navigate(['/auth/login']);
        }
    }
    GetAllVendorOnBoardings(): void {
        this.IsProgressBarVisibile = true;
        this._vendorRegistrationService.GetAllVendorOnBoardings().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                // this.AllVendorOnBoardings = JSON.parse(data.toString());
                console.log(this.AllVendorOnBoardings);
                this.VendorOnBoardingsDataSource = new MatTableDataSource(this.AllVendorOnBoardings);
                this.paginator = this.VendorOnBoardingsDataSource.paginator;
                this.sort = this.VendorOnBoardingsDataSource.sort;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
    }
    GetAllUserWithRoles(): void {
        this._masterService.GetAllUsers().subscribe(
            (data) => {
                this.AllUserWithRoles = <UserWithRole[]>data;
            },
            (err) => {
                console.log(err);
            }
        );
    }
    ReviewAndApproveVendor(bPVendorOnBoarding: BPVendorOnBoarding): void {
        console.log(bPVendorOnBoarding);
        // this._router.navigate(['approval/vendor']);
        this._router.navigate([
            '/approval',
            bPVendorOnBoarding.TransID
        ]);
    }
    // formatSubtitle = (): string => {
    //     return 'Effiency';
    // }
    // getStatusColor(element: BPVendorOnBoarding, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case 'ASN':
    //             return element.Status === 'Open' ? 'gray' : element.Status === 'BPVendorOnBoarding' ? '#efb577' : '#34ad65';
    //         case 'Gate':
    //             return element.Status === 'Open' ? 'gray' : element.Status === 'BPVendorOnBoarding' ? 'gray' : element.Status === 'ASN' ? '#efb577' : '#34ad65';
    //         case 'GRN':
    //             return element.Status === 'Open' ? 'gray' : element.Status === 'BPVendorOnBoarding' ? 'gray' : element.Status === 'ASN' ? 'gray' :
    //                 element.Status === 'Gate' ? '#efb577' : '#34ad65';
    //         default:
    //             return '';
    //     }
    // }
    // getTimeline(element: BPVendorOnBoarding, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case 'ASN':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'orange-timeline' : 'green-timeline';
    //         case 'Gate':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'white-timeline' : element.Status === 'ASN' ? 'orange-timeline' : 'green-timeline';
    //         case 'GRN':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' :
    //                 element.Status === 'Gate' ? 'orange-timeline' : 'green-timeline';
    //         default:
    //             return '';
    //     }
    // }
    // getRestTimeline(element: BPVendorOnBoarding, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case 'ASN':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'white-timeline' : 'green-timeline';
    //         case 'Gate':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' : 'green-timeline';
    //         case 'GRN':
    //             return element.Status === 'Open' ? 'white-timeline' : element.Status === 'BPVendorOnBoarding' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' :
    //                 element.Status === 'Gate' ? 'white-timeline' : 'green-timeline';
    //         default:
    //             return '';
    //     }
    // }


}
