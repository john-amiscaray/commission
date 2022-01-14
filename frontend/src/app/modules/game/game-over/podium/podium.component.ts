import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-podium',
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss'],
})
export class PodiumComponent implements OnInit {

  @Input()
  score: number

  @Input()
  name: string

  @Input()
  placement: number

  constructor() { }

  ngOnInit() {}

}
