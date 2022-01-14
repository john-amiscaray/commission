import {Component, Input, OnInit} from '@angular/core';
import {Subject} from "rxjs";

@Component({
  selector: 'app-game-clock',
  templateUrl: './game-clock.component.html',
  styleUrls: ['./game-clock.component.scss'],
})
export class GameClockComponent implements OnInit {

  @Input()
  timePerRound: number
  @Input()
  startEvent: Subject<any>
  @Input()
  pauseEvent: Subject<boolean>
  currentTime: number

  private intervalID: any

  constructor() { }

  ngOnInit() {

    this.currentTime = this.timePerRound;

    this.startEvent.subscribe(_ => {

      this.createTimerInterval();

    });

    this.pauseEvent.subscribe(pauseGame => {

      if(pauseGame){
        console.log('--------THE CLOCK WAS PAUSED SUCCESSFULLY--------');
        if(this.intervalID){
          clearInterval(this.intervalID);
        }else{
          throw new Error('Failed to pause the game, the intervalID was not stored!');
        }
      }else{
        console.log('--------THE CLOCK WAS UNPAUSED SUCCESSFULLY--------');
        this.createTimerInterval();
      }

    });

  }

  private createTimerInterval(){

    let self = this;

    let timer = setInterval(() => {

      self.currentTime -= 1;
      if(self.currentTime <= 0){
        stop();
      }

    }, 1000);

    this.intervalID = timer;

    function stop(){

      clearInterval(timer);
      self.currentTime = self.timePerRound;

    }

  }

}
