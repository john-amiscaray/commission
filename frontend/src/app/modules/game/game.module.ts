import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import {ProfilePageModule} from "../profile/profile.module";
import {MatchStartComponent} from "./game-message/match-start/match-start.component";
import {JudgeRequestComponent} from "./game-message/judge-request/judge-request.component";
import {MatchEndComponent} from "./game-message/match-end/match-end.component";
import {MatchResultsComponent} from "./game-message/match-results/match-results.component";
import {GameOverComponent} from "./game-over/game-over.component";
import {PodiumComponent} from "./game-over/podium/podium.component";
import {GameClockComponent} from "./game-clock/game-clock.component";
import {GameMessageComponent} from "./game-message/game-message.component";
import {GamePauseComponent} from "./game-message/game-pause/game-pause.component";
import {PalletColorComponent} from "./pallet-color/pallet-color.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GamePageRoutingModule,
        ProfilePageModule
    ],
  declarations: [GamePage, MatchStartComponent, JudgeRequestComponent, MatchEndComponent, MatchResultsComponent,
    GameOverComponent, PodiumComponent, GameClockComponent, GameMessageComponent, GamePauseComponent, PalletColorComponent]
})
export class GamePageModule {}
