import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import {
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatSnackBar,
    MatDialog,
} from '@angular/material';
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
    animations: fuseAnimations,
})
export class DashboardComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    MenuItems: string[];
    PlantList: string[] = [];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    // AllUserWithRoles: UserWithRole[] = [];
    VendorOnBoardingsDisplayedColumns: string[] = [
        'Name',
        'LegalName',
        'Type',
        'Country',
        'Phone1',
        'Email1',
        'CreatedOn',
        'Status',
        'Action',
    ];
    VendorOnBoardingsDataSource: MatTableDataSource<BPVendorOnBoarding>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<any>(true, []);
    searchText = '';
    AllVendorOnBoardings: BPVendorOnBoarding[] = [];
    public tab1: boolean;
    public tab2: boolean;
    public tab3: boolean;
    public tabCount: number;
    public OpenCount: number;
    public ApprovedCount: number;
    public RejectedCount: number;

    constructor(
        public snackBar: MatSnackBar,
        private _router: Router,
        public dialog: MatDialog,
        private _masterService: MasterService,
        private _dashboardService: DashboardService,
        private _vendorRegistrationService: VendorRegistrationService
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.authenticationDetails = new AuthenticationDetails();
        this.IsProgressBarVisibile = false;
        this.tab1 = true;
        this.tab2 = false;
        this.tab3 = false;
    }

    ngOnInit(): void {
        this.tabCount = 1;
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.currentUserName = this.authenticationDetails.UserName;
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(
                ','
            );
            if (this.MenuItems.indexOf('Admin Dashboard') < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    'You do not have permission to visit this page',
                    SnackBarStatus.danger
                );
                this._router.navigate(['/auth/login']);
            }
            if (this.currentUserRole === 'Approver') {
                // this._masterService
                //     .GetApproverPlants(this.currentUserID)
                //     .subscribe((data) => {
                //         this.PlantList = data as string[];
                //         if (this.PlantList.length > 0) {
                //             this.GetAllOpenVendorOnBoardings();
                //             this.GetAllApprovedVendorOnBoardingsCount();
                //             this.GetAllRejectedVendorOnBoardingsCount();
                //         }
                //     });
                this.GetAllOpenVendorOnBoardings();
                this.GetAllApprovedVendorOnBoardingsCount();
                this.GetAllRejectedVendorOnBoardingsCount();
            } else {
                this.GetAllOpenVendorOnBoardings();
                this.GetAllApprovedVendorOnBoardingsCount();
                this.GetAllRejectedVendorOnBoardingsCount();
            }
            // this.GetAllUserWithRoles();
        } else {
            this._router.navigate(['/auth/login']);
        }
    }

    tabone(): void {
        this.tab1 = true;
        this.tab2 = false;
        this.tab3 = false;
        this.GetAllOpenVendorOnBoardings();
        this.tabCount = 1;
    }

    tabtwo(): void {
        this.tab1 = false;
        this.tab2 = true;
        this.tab3 = false;
        this.GetAllApprovedVendorOnBoardings();
        this.tabCount = 2;
    }

    tabthree(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = true;
        this.GetAllRejectedVendorOnBoardings();
        this.tabCount = 3;
    }

    GetAllVendorOnBoardings(): void {
        this.IsProgressBarVisibile = true;
        this._vendorRegistrationService.GetAllVendorOnBoardings().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                this.VendorOnBoardingsDataSource = new MatTableDataSource(
                    this.AllVendorOnBoardings
                );
                this.VendorOnBoardingsDataSource.paginator = this.paginator;
                this.VendorOnBoardingsDataSource.sort = this.sort;
                console.log("GetAllVendorOnBoardings", this.AllVendorOnBoardings);
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err instanceof Object ? 'Something went wrong' : err,
                    SnackBarStatus.danger
                );
            }
        );
    }

    GetAllOpenVendorOnBoardings(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {
            this._vendorRegistrationService
                .GetAllOpenVendorOnBoardingsByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.OpenCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.OpenCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                        console.log("GetAllOpenVendorOnBoardings", this.AllVendorOnBoardings);
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            this._vendorRegistrationService
                .GetAllOpenVendorOnBoardings()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.OpenCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.OpenCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetAllApprovedVendorOnBoardings(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {
            this._vendorRegistrationService
                .GetAllApprovedVendorOnBoardingsByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.ApprovedCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.ApprovedCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            this._vendorRegistrationService
                .GetAllApprovedVendorOnBoardings()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.ApprovedCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.ApprovedCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetAllRejectedVendorOnBoardings(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {

            this._vendorRegistrationService
                .GetAllRejectedVendorOnBoardingsByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.RejectedCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.RejectedCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object ? 'Something went wrong' : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
        else {
            this._vendorRegistrationService
                .GetAllRejectedVendorOnBoardings()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.AllVendorOnBoardings = <BPVendorOnBoarding[]>data;
                        if (
                            this.AllVendorOnBoardings &&
                            this.AllVendorOnBoardings.length > 0
                        ) {
                            this.RejectedCount = this.AllVendorOnBoardings.length;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        } else {
                            this.RejectedCount = 0;
                            this.VendorOnBoardingsDataSource = new MatTableDataSource(
                                this.AllVendorOnBoardings
                            );
                            this.VendorOnBoardingsDataSource.paginator = this.paginator;
                            this.VendorOnBoardingsDataSource.sort = this.sort;
                        }
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object ? 'Something went wrong' : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetAllOpenVendorOnBoardingsCount(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {
            this._vendorRegistrationService
                .GetAllOpenVendorOnBoardingsCountByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.OpenCount = <any>data;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object ? 'Something went wrong' : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            this._vendorRegistrationService
                .GetAllOpenVendorOnBoardingsCount()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.OpenCount = <any>data;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object ? 'Something went wrong' : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetAllApprovedVendorOnBoardingsCount(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {
            this._vendorRegistrationService
                .GetAllApprovedVendorOnBoardingsByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        console.log(
                            'GetAllApprovedVendorOnBoardingsByPlant',
                            data
                        );
                        this.IsProgressBarVisibile = false;
                        this.ApprovedCount = data.length;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            this._vendorRegistrationService
                .GetAllApprovedVendorOnBoardingsCount()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.ApprovedCount = <any>data;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    GetAllRejectedVendorOnBoardingsCount(): void {
        this.IsProgressBarVisibile = true;
        if (this.currentUserRole === 'Approver') {
            this._vendorRegistrationService
                .GetAllRejectedVendorOnBoardingsByApprover(this.currentUserName)
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.RejectedCount = data.length;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            this._vendorRegistrationService
                .GetAllRejectedVendorOnBoardingsCount()
                .subscribe(
                    (data) => {
                        this.IsProgressBarVisibile = false;
                        this.RejectedCount = <any>data;
                    },
                    (err) => {
                        console.error(err);
                        this.IsProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? 'Something went wrong'
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        }
    }

    // GetAllUserWithRoles(): void {
    //     this._masterService.GetAllUsers().subscribe(
    //         (data) => {
    //             this.AllUserWithRoles = <UserWithRole[]>data;
    //         },
    //         (err) => {
    //             console.log(err);
    //         }
    //     );
    // }

    ReviewAndApproveVendor(bPVendorOnBoarding: BPVendorOnBoarding): void {
        this._router.navigate(['/approval', bPVendorOnBoarding.TransID]);
    }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.VendorOnBoardingsDataSource.filter = filterValue.trim().toLowerCase();
    }
}
