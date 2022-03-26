import { Component, OnInit } from '@angular/core';
import {DarkModeService} from "angular-dark-mode";

@Component({
  selector: 'app-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss'],
})
export class LoadComponent implements OnInit {

  constructor(public darkModeService: DarkModeService) { }

  ngOnInit() {}

}
