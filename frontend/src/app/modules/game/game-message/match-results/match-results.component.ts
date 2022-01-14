import {Component, Input, OnInit} from '@angular/core';
import {GameStatusComponent} from "../../game-status-component-interface";
import {GameMessageDetails} from "../../../../dtos/GameMessageDetails";

@Component({
  selector: 'app-round-results',
  templateUrl: './match-results.component.html',
  styleUrls: ['./match-results.component.scss'],
})
export class MatchResultsComponent implements OnInit, GameStatusComponent {

  @Input()
  gameMessageDetails: GameMessageDetails

  constructor() { }

  ngOnInit() {}

}
