import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JoinGamePageRoutingModule } from './join-game-routing.module';

import { JoinGamePage } from './join-game.page';
import {CommonComponentsModule} from "../common-components/common-components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JoinGamePageRoutingModule,
    CommonComponentsModule
  ],
  declarations: [JoinGamePage]
})
export class JoinGamePageModule {}
