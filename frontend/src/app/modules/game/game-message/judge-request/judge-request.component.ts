import {Component, Input, OnInit} from '@angular/core';
import {GameMessageDetails} from "../../../../dtos/GameMessageDetails";
import {GameStatusComponent} from "../../game-status-component-interface";

@Component({
  selector: 'app-judge-request',
  templateUrl: './judge-request.component.html',
  styleUrls: ['./judge-request.component.scss'],
})
export class JudgeRequestComponent implements OnInit, GameStatusComponent {

  @Input()
  gameMessageDetails: GameMessageDetails

  constructor() { }

  ngOnInit() {

  }

}
