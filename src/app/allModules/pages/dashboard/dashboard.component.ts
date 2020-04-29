import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatTabChangeEvent, MatIconRegistry, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MenuApp, AuthenticationDetails, UserView, UserWithRole } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { Task, TaskView, Input, Output, Logic, Validation, TaskSubGroupView, SketchView, AttachmentDetails } from 'app/models/task';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ProjectService } from 'app/services/project.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { Guid } from 'guid-typescript';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DashboardService } from 'app/services/dashboard.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { ChartType } from 'chart.js';
// import 'chart.piecelabel.js';
// import 'chartjs-plugin-labels';
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
    AllOwners: UserWithRole[] = [];
    AllTasks: Task[] = [];
    AllTasksCount: number;
    AllNewTasksCount: number;
    AllOpenTasksCount: number;
    AllEscalatedTasksCount: number;
    AllReworkTasksCount: number;
    posDisplayedColumns: string[] = [
        'TransID',
        'Version',
        'PODate',
        'Status',
        'Document',
        'NextProcess',
        'Action'
    ];
    posDataSource: MatTableDataSource<PO>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    selection = new SelectionModel<any>(true, []);
    AllTickets: any[] = [];
    AllActivities: any[] = [];
    Fulfilments: any[] = [];
    donutChartData: any[] = [];
    DeliveryStatus: any[] = [];
    searchText = '';
    FilterVal = 'All';
    Pos: PO[] = [];
    public doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'left' },
        cutoutPercentage: 80,
        elements: {
            arc: {
                borderWidth: 0
            }
        },
        // pieceLabel: [
        //     {
        //         render: 'label',
        //         position: 'outside'
        //     },
        //     {
        //         render: 'value'
        //     }
        // ]
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value + ' %';
                },
                fontColor: '#000',
                position: 'outside'
            }
        }
    };
    public doughnutChartType: ChartType = 'doughnut';
    public doughnutChartLabels: any[] = ['Open', 'Scheduled', 'In Progress', 'Pending'];
    public doughnutChartData: any[] = [
        [40, 20, 30, 10]
    ];
    public colors: any[] = [{ backgroundColor: ['#fb863a', '#40a8e2', '#485865', '#40ed9a'] }];

    // public doughnutChartData: any[] = [
    //     [40, 20, 30, 10], [19], [1]
    // ];
    // public colors: any[] = [{ backgroundColor: ['#fb863a', '#40a8e2', '#485865', '#40ed9a'] }, { backgroundColor: ['#ffffff'] }, { backgroundColor: ['#fb863a'] }];

    public barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: 'top',
            align: 'end'
        },
        // // We use these empty structures as placeholders for dynamic theming.
        scales: {
            xAxes: [{
                barPercentage: 1.3,
                categoryPercentage: -0.5
            }],
            yAxes: [{
                ticks: {
                    stepSize: 25,
                    beginAtZero: true
                }
            }],
        },
        // plugins: {
        //     datalabels: {
        //         anchor: 'end',
        //         align: 'end',
        //     }
        // }
    };
    public barChartLabels: any[] = ['17/02/20', '18/02/20', '19/02/20', '20/02/20', '21/02/20'];
    public barChartType: ChartType = 'bar';
    public barChartLegend = true;
    // public barChartPlugins = [pluginDataLabels];
    public barChartData: any[] = [
        { data: [45, 70, 65, 20, 80], label: 'Actual' },
        { data: [87, 50, 40, 71, 56], label: 'Planned' }
    ];
    public barColors: any[] = [{ backgroundColor: '#40a8e2' }, { backgroundColor: '#fb863a' }];
    constructor(
        private _router: Router,
        private _dashboardService: DashboardService,
        private _shareParameterService: ShareParameterService,
        public snackBar: MatSnackBar,
        private _masterService: MasterService,
        private _projectService: ProjectService,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = false;
    }

    ngOnInit(): void {
        // Retrive authorizationData
        // const retrievedObject = localStorage.getItem('authorizationData');
        // if (retrievedObject) {
        //     this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
        //     this.currentUserID = this.authenticationDetails.userID;
        //     this.currentUserRole = this.authenticationDetails.userRole;
        //     this.MenuItems = this.authenticationDetails.menuItemNames.split(',');
        //     if (this.MenuItems.indexOf('Dashboard') < 0) {
        //         this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        //         );
        //         this._router.navigate(['/auth/login']);
        //     }

        // } else {
        //     this._router.navigate(['/auth/login']);
        // }
        this.Fulfilments = [
            {
                'name': 'Open',
                'value': 40,
                'label': '40%'
            },
            {
                'name': 'Scheduled',
                'value': 20,
                'label': '20%'
            },
            {
                'name': 'In Progress',
                'value': 30,
                'label': '30%'
            },
            {
                'name': 'Pending',
                'value': 10,
                'label': '10%'
            }
        ];
        this.donutChartData = [
            {
                label: 'Liverpool FC',
                value: 5,
                color: 'red',
            },
            {
                label: 'Real Madrid	',
                value: 13,
                color: 'black',
            },
            {
                label: 'FC Bayern München',
                value: 5,
                color: 'blue',
            },
        ];
        this.DeliveryStatus = [
            {
                'name': '17/02/20',
                'series': [
                    {
                        'name': 'Planned',
                        'value': 88
                    },
                    {
                        'name': 'Actual',
                        'value': 70
                    }
                ]
            },

            {
                'name': '18/02/20',
                'series': [
                    {
                        'name': 'Planned',
                        'value': 60
                    },
                    {
                        'name': 'Actual',
                        'value': 88
                    }
                ]
            },
            {
                'name': '19/02/20',
                'series': [
                    {
                        'name': 'Planned',
                        'value': 40
                    },
                    {
                        'name': 'Actual',
                        'value': 88
                    }
                ]
            },
        ];

        this.Pos = [
            { TransID: 122, Version: '1.1', PODate: new Date(), Status: 'Open', Document: '', NextProcess: 'Acknowledgement' },
            { TransID: 123, Version: '1.1', PODate: new Date(), Status: 'PO', Document: '', NextProcess: 'Acknowledgement' },
            { TransID: 124, Version: '1.1', PODate: new Date(), Status: 'ASN', Document: '', NextProcess: 'Acknowledgement' },
            { TransID: 125, Version: '1.1', PODate: new Date(), Status: 'Gate', Document: '', NextProcess: 'Acknowledgement' },
            { TransID: 126, Version: '1.1', PODate: new Date(), Status: 'GRN', Document: '', NextProcess: 'Acknowledgement' },
        ];
        this.posDataSource = new MatTableDataSource(this.Pos);
    }

    formatSubtitle = (): string => {
        return 'Effiency';
    }
    pieChartLabel(Fulfilments: any[], name: string): string {
        const item = Fulfilments.filter(data => data.name === name);
        if (item.length > 0) {
            return item[0].label;
        }
        return name;
    }

    getStatusColor(element: PO, StatusFor: string): string {
        switch (StatusFor) {
            case 'ASN':
                return element.Status === 'Open' ? 'gray' : element.Status === 'PO' ? '#efb577' : '#34ad65';
            case 'Gate':
                return element.Status === 'Open' ? 'gray' : element.Status === 'PO' ? 'gray' : element.Status === 'ASN' ? '#efb577' : '#34ad65';
            case 'GRN':
                return element.Status === 'Open' ? 'gray' : element.Status === 'PO' ? 'gray' : element.Status === 'ASN' ? 'gray' :
                    element.Status === 'Gate' ? '#efb577' : '#34ad65';
            default:
                return '';
        }
    }
    getTimeline(element: PO, StatusFor: string): string {
        switch (StatusFor) {
            case 'ASN':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'orange-timeline' : 'green-timeline';
            case 'Gate':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'white-timeline' : element.Status === 'ASN' ? 'orange-timeline' : 'green-timeline';
            case 'GRN':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' :
                    element.Status === 'Gate' ? 'orange-timeline' : 'green-timeline';
            default:
                return '';
        }
    }
    getRestTimeline(element: PO, StatusFor: string): string {
        switch (StatusFor) {
            case 'ASN':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'white-timeline' : 'green-timeline';
            case 'Gate':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' : 'green-timeline';
            case 'GRN':
                return element.Status === 'Open' ? 'white-timeline' : element.Status === 'PO' ? 'white-timeline' : element.Status === 'ASN' ? 'white-timeline' :
                    element.Status === 'Gate' ? 'white-timeline' : 'green-timeline';
            default:
                return '';
        }
    }
}

export class PO {
    TransID: number;
    Version: string;
    PODate: Date;
    Status: string;
    Document: string;
    NextProcess: string;
}
