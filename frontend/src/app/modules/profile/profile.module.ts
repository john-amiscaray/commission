import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import {ProfilePictureSelectComponent} from "./profile-picture-select/profile-picture-select.component";
import {ProfileNameSelectComponent} from "./profile-name-select/profile-name-select.component";
import {CommonComponentsModule} from "../common-components/common-components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProfilePageRoutingModule,
        CommonComponentsModule
    ],
    declarations: [ProfilePage, ProfilePictureSelectComponent, ProfileNameSelectComponent]
})
export class ProfilePageModule {}
