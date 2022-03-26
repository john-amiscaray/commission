import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {GameService} from "../../services/game.service";
import {GameSettings} from "../../dtos/GameSettings";
import {UserLobbyStatus} from "../../dtos/UserLobbyStatus";
import {ParticipantInfo} from "../../dtos/GameIdentity";
import {Router} from "@angular/router";
import {GameMessageService} from "../../services/game-message.service";
import {ProfilePictureService} from "../../services/profile-picture.service";
import {GameMessageDetails} from "../../dtos/GameMessageDetails";
import {DarkModeService} from "angular-dark-mode";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  showGameMessage: boolean = false;
  gameMessageIdx = 0;
  gameMessageTypes: Array<GameMessageDetails>

  constructor(public auth: AuthService, public game: GameService,
              public router: Router, public msg: GameMessageService, public darkModeService: DarkModeService) {}

  ngOnInit(){

    // let lobbyStatus = new Map<number, UserLobbyStatus>();
    //
    // lobbyStatus.set(1, new UserLobbyStatus());
    // lobbyStatus.get(1).ready = true;
    // lobbyStatus.get(1).user = new ParticipantInfo(1, ProfilePictureService.Dog, 'Zee', 'TEST');
    //
    // lobbyStatus.set(2, new UserLobbyStatus());
    // lobbyStatus.get(2).ready = true;
    // lobbyStatus.get(2).user = new ParticipantInfo(2, ProfilePictureService.Dog, 'Bobbert', 'TEST');
    //
    // lobbyStatus.set(3, new UserLobbyStatus());
    // lobbyStatus.get(3).ready = true;
    // lobbyStatus.get(3).user = new ParticipantInfo(3, ProfilePictureService.Dog, 'Bee', 'TEST');
    // let mockDrawings = new Map();
    // mockDrawings.set(1, 'https://picsum.photos/150');
    // mockDrawings.set(2, 'https://picsum.photos/150');
    // mockDrawings.set(3, 'https://picsum.photos/150');
    //
    // this.game.init('TEST', new GameSettings(3, 30, 3), lobbyStatus, [1, 2, 3]);
    // this.gameMessageTypes = [
    //   this.msg.getMatchStartDetails(false),
    //   this.msg.getMatchStartDetails(true),
    //   this.msg.getJudgeRequestDetails(false, 'FOO'),
    //   this.msg.getJudgeRequestDetails(true, 'FOO'),
    //   this.msg.getMatchEndDetails(true, mockDrawings),
    //   this.msg.getMatchEndDetails(false, mockDrawings),
    //   this.msg.getMatchResultsDetails(true, 1),
    //   this.msg.getMatchResultsDetails(false, 1),
    //   this.msg.getMatchPauseDetails()
    // ];

  }

  ionViewDidEnter(){

    if(this.auth.uuidAttemptedToGenerate && !this.auth.getUUID()){

      this.auth.generateAndSaveUUID();

    }

  }

  enterTestGameState(){

    // let lobbyStatus = new Map<number, UserLobbyStatus>();
    //
    // lobbyStatus.set(1, new UserLobbyStatus());
    // lobbyStatus.get(1).ready = true;
    // lobbyStatus.get(1).user = new ParticipantInfo(1, ProfilePictureService.Dog, 'Zee', 'TEST');
    //
    // lobbyStatus.set(2, new UserLobbyStatus());
    // lobbyStatus.get(2).ready = true;
    // lobbyStatus.get(2).user = new ParticipantInfo(2, ProfilePictureService.Dog, 'Bobbert', 'TEST');
    //
    // lobbyStatus.set(3, new UserLobbyStatus());
    // lobbyStatus.get(3).ready = true;
    // lobbyStatus.get(3).user = new ParticipantInfo(3, ProfilePictureService.Dog, 'Bee', 'TEST');
    //
    // this.game.init('TEST', new GameSettings(3, 30, 3), lobbyStatus, [1, 2, 3]);
    this.router.navigate(['game']);

  }

  toggleGameMessage(){

    this.gameMessageIdx = this.gameMessageIdx + 1 < this.gameMessageTypes.length ? this.gameMessageIdx + 1 : 0

  }

}
