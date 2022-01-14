import {Component, Input, OnInit} from '@angular/core';
import {ToastService} from "../../../../services/toast.service";
import {GameJudgeAction, GameJudgeActionType} from "../../../../dtos/GameJudgeAction";
import {AuthService} from "../../../../services/auth.service";
import {GameStatusComponent} from "../../game-status-component-interface";
import {GameService} from "../../../../services/game.service";
import {GameMessageDetails} from "../../../../dtos/GameMessageDetails";
import {PromptGeneratorService} from "../../../../services/prompt-generator.service";
import {LobbyService} from "../../../../services/lobby.service";

@Component({
  selector: 'app-round-start',
  templateUrl: './match-start.component.html',
  styleUrls: ['./match-start.component.scss'],
})
export class MatchStartComponent implements OnInit, GameStatusComponent {


  @Input()
  gameMessageDetails: GameMessageDetails

  thingToDraw: string = ''

  private timeOut = null;

  constructor(private toast: ToastService, private game: GameService, private lobby: LobbyService,
              private auth: AuthService, private prompt: PromptGeneratorService) { }

  ngOnInit() {

    let self = this;

    if(this.gameMessageDetails.isJudge){
      this.timeOut = setTimeout(() => {

        self.generateRandomPrompt(() => {

          setTimeout(() => {

            self.dismiss(true);

          }, 1500);

        });

      }, 60000);
    }

  }

  dismiss(isTimout: boolean = false){

    if(this.timeOut && !isTimout){

      clearTimeout(this.timeOut);

    }
    if(this.thingToDraw && this.thingToDraw.trim() != ''){

      this.game.sendJudgeAction(new GameJudgeAction(parseInt(this.auth.getGameId()), this.thingToDraw,
        GameJudgeActionType.CHOSE_SOMETHING_TO_DRAW, -1));

    }else{

      this.toast.customToastMessage('Please put a valid prompt for them to draw.');

    }

  }

  generateRandomPrompt(callback: Function = () => {}){

    this.prompt.getRandomPrompt(this.lobby.roomCode)
      .subscribe(res => {

        this.thingToDraw = res;
        callback();

      })

  }

}
