import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {GamePageModule} from "../game/game.module";
import {CommonComponentsModule} from "../common-components/common-components.module";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
        GamePageModule,
        CommonComponentsModule
    ],
  declarations: [HomePage]
})
export class HomePageModule {}
