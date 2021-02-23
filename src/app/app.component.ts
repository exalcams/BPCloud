import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationTurkish } from 'app/navigation/i18n/tr';
import { MenuUpdataionService } from './services/menu-update.service';
import { MatDialogConfig, MatIconRegistry, MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationDialogComponent } from './notifications/notification-dialog/notification-dialog.component';
import { AuthenticationDetails ,SessionMaster} from './models/master';
import { NotificationSnackBarComponent } from './notifications/notification-snack-bar/notification-snack-bar.component';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;
    // private _authService: any;
    authenticationDetails: any;
    private _router: any;
    private _compiler: any;
    dialog: any;
    sessionMaster: SessionMaster;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    sessionTimeOut: number;
    snackBar: MatSnackBar;
    isShowPopup: boolean;
    // bnIdle: any;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private bnIdle: BnNgIdleService,
        private _authService: AuthService,
        private _menuUpdationService: MenuUpdataionService,
        mdIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer
    ) {
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.sessionTimeOut = 300;
        this.isShowPopup = true;
        this.GetSessionMasterByProject();
        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'tr']);

        // Set the default language
        this._translateService.setDefaultLang('en');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(navigationEnglish, navigationTurkish);

        // Use a language
        this._translateService.use('en');
        mdIconRegistry.addSvgIcon('menuIcon', sanitizer.bypassSecurityTrustResourceUrl('assets/images/menu/menu.svg'));
        mdIconRegistry.addSvgIcon('bpCollapsedMenuIcon', sanitizer.bypassSecurityTrustResourceUrl('assets/images/menu/bpCollapsedMenuIcon.svg'));
        mdIconRegistry.addSvgIcon('bpOpenedMenuIcon', sanitizer.bypassSecurityTrustResourceUrl('assets/images/menu/bpOpenedMenuIcon.svg'));
        mdIconRegistry.addSvgIcon('dashboardIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/dashboard.svg'));
        mdIconRegistry.addSvgIcon('receiptIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/receipt.svg'));
        mdIconRegistry.addSvgIcon('assignmentIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/assignment.svg'));
        mdIconRegistry.addSvgIcon('viewListIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/viewList.svg'));
        mdIconRegistry.addSvgIcon('newViewListIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/newViewList.svg'));
        mdIconRegistry.addSvgIcon('accountCircleIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/accountCircle.svg'));
        mdIconRegistry.addSvgIcon('exitToAppIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/exitToApp.svg'));
        mdIconRegistry.addSvgIcon('closeIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/close.svg'));
        mdIconRegistry.addSvgIcon('infoIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/info.svg'));
        mdIconRegistry.addSvgIcon('keyboardArrowDownIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/keyboardArrowDown.svg'));
        mdIconRegistry.addSvgIcon('keyboardArrowRightIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/keyboardArrowRight.svg'));
        mdIconRegistry.addSvgIcon('addIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/add-button.svg'));
        mdIconRegistry.addSvgIcon('searchIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/search.svg'));
        mdIconRegistry.addSvgIcon('reportIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/report.svg'));
        mdIconRegistry.addSvgIcon('powerIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/power.svg'));
        mdIconRegistry.addSvgIcon('powerOffIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/powerOff.svg'));
        mdIconRegistry.addSvgIcon('taskIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/task.svg'));
        mdIconRegistry.addSvgIcon('taskGroupIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/taskGroup.svg'));
        mdIconRegistry.addSvgIcon('projectIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/project.svg'));
        mdIconRegistry.addSvgIcon('addBlueIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/addBlue.svg'));
        mdIconRegistry.addSvgIcon('detailsIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/details.svg'));
        mdIconRegistry.addSvgIcon('mydetailsIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/mydetails.svg'));
        /**
         * ------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ------------------------------------------------------------------
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('tr');
         });
         */

        /**
         * ------------------------------------------------------------------
         * ngxTranslate Fix End
         * ------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    GetSessionMasterByProject(): void {
        this._authService.GetSessionMasterByProject('BPCloud').subscribe(
            (data) => {
                this.sessionMaster = data as SessionMaster;
                if (this.sessionMaster && this.sessionMaster.SessionTimeOut) {
                    this.sessionTimeOut = this.sessionMaster.SessionTimeOut * 60;
                    this.InitializeNgIdleService();
                } else {
                    this.InitializeNgIdleService();
                }
            },
            (err) => {
                this.InitializeNgIdleService();
            }
        );
    }
    InitializeNgIdleService(): void {
        this.bnIdle.startWatching(this.sessionTimeOut).subscribe((res) => {
            if (res) {
                // Retrive authorizationData
                const retrievedObject = localStorage.getItem('authorizationData');
                if (retrievedObject) {
                    this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
                    this.SignoutAndExit();
                }
            }
        });
    }
    OpenInformationDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: 'Your session has expired! Please login again',
            panelClass: 'information-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                this._router.navigate(['auth/login']);
            },
            err => {
                this._router.navigate(['auth/login']);
            });
    }

    SignoutAndExit(): void {
        this._authService.SignOut(this.authenticationDetails.UserID).subscribe(
            (data) => {
                localStorage.removeItem('authorizationData');
                localStorage.removeItem('menuItemsData');
                this._compiler.clearCache();
                // this._router.navigate(['auth/login']);
                console.error('Your session has expired! Please login again');
                this.OpenInformationDialog();
                // this.notificationSnackBarComponent.openSnackBar('Idle timout occurred , please login again', SnackBarStatus.danger);
            },
            (err) => {
                console.error(err);
                // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                localStorage.removeItem('authorizationData');
                localStorage.removeItem('menuItemsData');
                this._compiler.clearCache();
                // this._router.navigate(['auth/login']);
                console.error('Your session has expired! Please login again');
                this.OpenInformationDialog();
                // this.notificationSnackBarComponent.openSnackBar('Idle timout occurred , please login again', SnackBarStatus.danger);
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });

        // Retrive menu items from Local Storage    
        const menuItems = localStorage.getItem('menuItemsData');
        if (menuItems) {
            this.navigation = JSON.parse(menuItems);
            this._fuseNavigationService.unregister('main');
            this._fuseNavigationService.register('main', this.navigation);
            this._fuseNavigationService.setCurrentNavigation('main');
        }

        // Update the menu items on First time after log in
        this._menuUpdationService.GetAndUpdateMenus().subscribe(
            data => {
                this.navigation = data;
                this._fuseNavigationService.unregister('main');
                this._fuseNavigationService.register('main', this.navigation);
                this._fuseNavigationService.setCurrentNavigation('main');
            }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }
}
