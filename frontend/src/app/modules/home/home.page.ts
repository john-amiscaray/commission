import { Component } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {GameService} from "../../services/game.service";
import {GameSettings} from "../../dtos/GameSettings";
import {UserLobbyStatus} from "../../dtos/UserLobbyStatus";
import {ParticipantInfo} from "../../dtos/GameIdentity";
import {Router} from "@angular/router";
import {GameMessageService} from "../../services/game-message.service";
import {ProfilePictureService} from "../../services/profile-picture.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public auth: AuthService, public game: GameService, public router: Router, public msg: GameMessageService) {}

  ionViewDidEnter(){

    if(this.auth.uuidAttemptedToGenerate && !this.auth.getUUID()){

      this.auth.generateAndSaveUUID();

    }

  }

  enterTestGameState(){

    let lobbyStatus = new Map<number, UserLobbyStatus>();

    lobbyStatus.set(1, new UserLobbyStatus());
    lobbyStatus.get(1).ready = true;
    lobbyStatus.get(1).user = new ParticipantInfo(1, ProfilePictureService.Dog, 'Zee', 'TEST');

    lobbyStatus.set(2, new UserLobbyStatus());
    lobbyStatus.get(2).ready = true;
    lobbyStatus.get(2).user = new ParticipantInfo(2, ProfilePictureService.Dog, 'Bobbert', 'TEST');

    lobbyStatus.set(3, new UserLobbyStatus());
    lobbyStatus.get(3).ready = true;
    lobbyStatus.get(3).user = new ParticipantInfo(3, ProfilePictureService.Dog, 'Bee', 'TEST');

    this.game.init('TEST', new GameSettings(3, 30, 3), lobbyStatus, [1, 2, 3]);
    this.router.navigate(['game']);

  }

}
