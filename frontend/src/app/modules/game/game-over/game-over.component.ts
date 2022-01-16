import {Component, Input} from '@angular/core';
import {ParticipantInfo} from "../../../dtos/GameIdentity";

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss'],
})
export class GameOverComponent {

  @Input()
  topThree: Map<ParticipantInfo, number>

  constructor() { }

}
