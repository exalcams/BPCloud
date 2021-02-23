import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule, MatDividerModule } from '@angular/material';

import { FuseNavigationModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { NavbarVerticalStyle1Component } from 'app/layout/components/navbar/vertical/style-1/style-1.component';
import { SharedModule } from 'app/shared/shared-module';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
    declarations: [
        NavbarVerticalStyle1Component
    ],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        FuseSharedModule,
        FuseNavigationModule,
        MatTooltipModule,
        SharedModule
    ],
    exports: [
        NavbarVerticalStyle1Component
    ]
})
export class NavbarVerticalStyle1Module {
}
