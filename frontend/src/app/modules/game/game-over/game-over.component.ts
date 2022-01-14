import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss'],
})
export class GameOverComponent {

  @Input()
  topThree: Map<string, number>

  constructor() { }

}
