import {Component, Input, OnInit} from '@angular/core';
import {GameStatusComponent} from "../../game-status-component-interface";
import {IonSlides} from "@ionic/angular";
import {GameJudgeAction, GameJudgeActionType} from "../../../../dtos/GameJudgeAction";
import {AuthService} from "../../../../services/auth.service";
import {GameService} from "../../../../services/game.service";
import {GameMessageDetails} from "../../../../dtos/GameMessageDetails";

@Component({
  selector: 'app-round-end',
  templateUrl: './match-end.component.html',
  styleUrls: ['./match-end.component.scss'],
})
export class MatchEndComponent implements OnInit, GameStatusComponent {

  @Input()
  gameMessageDetails: GameMessageDetails

  urls: Array<string>

  selectedDrawing: number

  private timeOut = null;

  constructor(private game: GameService, private auth: AuthService) { }

  ngOnInit() {

    if(this.gameMessageDetails.isJudge) {
      this.urls = Array.from(this.gameMessageDetails.drawingUrlMap.values());
      this.selectedDrawing = Array.from(this.gameMessageDetails.drawingUrlMap.keys())[0];
      this.timeOut = setTimeout(() => {

        let options = Array.from(this.gameMessageDetails.drawingUrlMap.keys());
        this.selectedDrawing = options[Math.floor(Math.random() * options.length)];
        this.submitChoice(true);

      }, 60000);
    }

  }

  slideChanged(slides: IonSlides){

    let self = this;

    slides.getActiveIndex().then(idx => {

      this.selectedDrawing = Array.from(self.gameMessageDetails.drawingUrlMap.keys())[idx];

    });

  }

  submitChoice(isTimeout: boolean = false){

    if(this.timeOut && !isTimeout){

      clearTimeout(this.timeOut);

    }

    this.game.sendJudgeAction(new GameJudgeAction(parseInt(this.auth.getGameId()), "",
      GameJudgeActionType.JUDGED, this.selectedDrawing));

  }

}
