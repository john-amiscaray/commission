import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {DarkModeService} from "angular-dark-mode";

@Component({
  selector: 'app-dark-mode-toggle',
  templateUrl: './dark-mode-toggle.component.html',
  styleUrls: ['./dark-mode-toggle.component.scss'],
})
export class DarkModeToggleComponent implements OnInit {

  darkMode$: Observable<boolean> = this.darkModeService.darkMode$;

  constructor(private darkModeService: DarkModeService) { }

  ngOnInit() {  }

  onClick(): void {
    this.darkModeService.toggle();
  }

}
