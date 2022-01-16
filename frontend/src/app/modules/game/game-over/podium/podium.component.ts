import {Component, Input, OnInit} from '@angular/core';
import {ProfilePictureService} from "../../../../services/profile-picture.service";

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

  @Input()
  pfpName: string

  constructor(public pfp: ProfilePictureService) { }

  ngOnInit() {}

}
