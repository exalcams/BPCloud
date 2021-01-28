import { NgModule } from '@angular/core';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatProgressSpinnerModule, MatIconModule, MatToolbarModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgetPasswordLinkDialogComponent } from './forget-password-link-dialog/forget-password-link-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { CookieOptions } from 'angular2-cookie/services/base-cookie-options';
const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'changePassword',
        component: ChangePasswordComponent
    },
    {
        path: 'forgotPassword',
        component: ForgotPasswordComponent
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];

@NgModule({
    providers:[ 
        CookieService,
        { provide: CookieOptions, useValue: {} } 
      ],
    declarations: [
        LoginComponent,
        ChangePasswordComponent,
        ForgotPasswordComponent,
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent
    ],
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        FuseSharedModule,
        MatDialogModule,
        MatIconModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        RouterModule.forChild(authRoutes)
    ],
    entryComponents: [
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent
    ]
})
export class AuthenticationModule {
}
