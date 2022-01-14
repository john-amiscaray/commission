import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LobbyPageRoutingModule } from './lobby-routing.module';

import { LobbyPage } from './lobby.page';
import {CommonComponentsModule} from "../common-components/common-components.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LobbyPageRoutingModule,
        CommonComponentsModule
    ],
  declarations: [LobbyPage]
})
export class LobbyPageModule{



}
