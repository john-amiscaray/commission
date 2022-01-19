import { Injectable } from '@angular/core';
import {GameStatusType} from "../dtos/GameStatus";
import {ModalController} from "@ionic/angular";
import {AuthService} from "./auth.service";
import {GameOverComponent} from "../modules/game/game-over/game-over.component";
import * as createjs from 'createjs-module';
import {GameMessageDetails} from "../dtos/GameMessageDetails";
import {GameMessageScreen} from "../modules/game/game-message/game-message-screen-enum";
import {GameService} from "./game.service";
import {ParticipantInfo} from "../dtos/GameIdentity";
import {ProfilePictureService} from "./profile-picture.service";
let queue;
(<any>window).createjs = createjs;

@Injectable({
  providedIn: 'root'
})
export class GameMessageService {

  constructor(private modalController: ModalController,
              private auth: AuthService, private game: GameService) {

    queue = new createjs.LoadQueue();
    let manifest = [
      { id: 'end-music', src: 'assets/sounds/game-end.wav' }
    ];
    queue.installPlugin(createjs.Sound);
    queue.loadManifest(manifest);

  }

  getMatchStartDetails(isJudge: boolean){

    return new GameMessageDetails('Match Started!', isJudge ?
      'You are the judge! You will decide the fate of the contestants this match.'
      : 'You are an artist! You will draw what the judge wants you to draw and sabotage other artists to win money. ' +
        '<span class="game-message-important">Waiting for the judge...</span>',
      GameStatusType.MATCH_START, isJudge, null, null, false);

  }

  getMatchEndDetails(isJudge: boolean, drawingUrlMap: Map<number, string>){

    return new GameMessageDetails("Time's up!", isJudge ?
      'The match ended! Pick who drew your request the best!':
      "Looks like time's up! Wait for the judge to decide your fate", GameStatusType.MATCH_END, isJudge,
      null, drawingUrlMap, false);

  }

  getMatchPauseDetails(){

    return new GameMessageDetails(
      `Waiting for a player to reconnect`,
      "A player was disconnected so we have to pause for a bit to wait for them to return.",
      GameStatusType.GAME_PAUSE, false, null, null, false);

  }

  getJudgeRequestDetails(isJudge: boolean, request: string){

    return new GameMessageDetails(isJudge ? 'Wait for the artists to finish': 'Start Drawing!',
      '', GameMessageScreen.JUDGE_REQUEST, isJudge, request, null, !isJudge);

  }

  getMatchResultsDetails(isJudge: boolean, winner: number){

    return new GameMessageDetails('The Judge Has Spoken!',
      `The winner of this match (and the $500 prize for it) is:
      <span class="game-message-important"> ${this.game.userConnectedStatus.get(winner).user.name} </span>`,
      GameMessageScreen.MATCH_RESULTS,
      isJudge, null, null, false);

  }


  async presentGameOverModal(scores: Map<ParticipantInfo, number>){

    const modal = await this.modalController.create({

      component: GameOverComponent,
      cssClass: 'game-modal',
      componentProps: {
        topThree: scores
      },
      backdropDismiss: true,
      swipeToClose: true

    });

    await this.modalController.getTop().then(modal => {
      modal.dismiss();
    })
    return await modal.present().then(_ => {
      createjs.Sound.play('end-music');
      setTimeout(_ => {

        modal.dismiss();

      }, 5000);
      this.game.clearResourcesOnComplete();
    });

  }

  async presentTestGameOverModal(){

    await this.presentGameOverModal(new Map([[new ParticipantInfo(1, ProfilePictureService.Bach, 'Bobbert', 'FAKE'), 200],
      [new ParticipantInfo(1, ProfilePictureService.Dog, 'Jimboo', 'FAKE'), 180],
      [new ParticipantInfo(1, ProfilePictureService.Cat, 'Larry', 'FAKE'), 50]]));

  }

}
