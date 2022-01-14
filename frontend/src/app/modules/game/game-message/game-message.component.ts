import {Component, Input, OnInit} from '@angular/core';
import {GameMessageScreen} from "./game-message-screen-enum";
import {GameMessageDetails} from "../../../dtos/GameMessageDetails";

@Component({
  selector: 'app-game-message',
  templateUrl: './game-message.component.html',
  styleUrls: ['./game-message.component.scss'],
})
export class GameMessageComponent implements OnInit {

  @Input()
  messageDetails: GameMessageDetails

  GameMessageConstants = GameMessageScreen

  constructor() { }

  ngOnInit() {}

}
