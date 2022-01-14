import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HostGamePageRoutingModule } from './host-game-routing.module';

import { HostGamePage } from './host-game.page';
import {CommonComponentsModule} from "../common-components/common-components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HostGamePageRoutingModule,
        ReactiveFormsModule,
        CommonComponentsModule
    ],
  declarations: [HostGamePage]
})
export class HostGamePageModule {}
