import {Component, Input, OnInit} from '@angular/core';
import {GameStatusComponent} from "../../game-status-component-interface";
import {GameMessageDetails} from "../../../../dtos/GameMessageDetails";

@Component({
  selector: 'app-game-pause',
  templateUrl: './game-pause.component.html',
  styleUrls: ['./game-pause.component.scss'],
})
export class GamePauseComponent implements OnInit, GameStatusComponent {

  @Input()
  gameMessageDetails: GameMessageDetails;

  constructor() { }

  ngOnInit() {}

}
