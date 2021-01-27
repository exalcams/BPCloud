import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import {
    MatFormFieldModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule
} from '@angular/material';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDonutChartModule } from 'ngx-doughnut-chart';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';

import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DecimalPipe } from '@angular/common';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ChartsModule } from 'ng2-charts';
// import 'chartjs-plugin-labels';
// import 'chartjs-plugin-annotation';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { SelectGstinDialogComponent } from './select-gstin-dialog/select-gstin-dialog.component';
import { PhoneDilaogComponent } from './phone-dilaog/phone-dilaog.component';
// import 'chart.piecelabel.js';

const routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'companydetails',
        component: CompanyDetailsComponent
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        // HttpClientModule,
        // TranslateModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        NgxChartsModule,
        NgxDonutChartModule,
        NgxMaterialTimepickerModule,

        ChartsModule,

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,

        
        // NgMultiSelectDropDownModule,

        FormsModule,
        NgCircleProgressModule.forRoot({
            // set defaults here
            radius: 60,
            outerStrokeWidth: 5,
            innerStrokeWidth: 2,
            outerStrokeColor: '#f3705a',
            innerStrokeColor: '#f3705a',
            showInnerStroke: true,
            animationDuration: 300,
        }),
        
    ],
    declarations: [DashboardComponent, CompanyDetailsComponent, PhoneDilaogComponent,SelectGstinDialogComponent],
    providers: [
        DecimalPipe
    ],
    entryComponents: [PhoneDilaogComponent,SelectGstinDialogComponent],
    // exports:[SelectGstinDialogComponent]
})
export class PagesModule { }
