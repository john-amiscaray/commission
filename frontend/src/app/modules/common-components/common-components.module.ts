import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoadComponent} from "./load/load.component";
import {IonicModule} from "@ionic/angular";
import {DarkModeToggleComponent} from "./dark-mode-toggle/dark-mode-toggle.component";



@NgModule({
  declarations: [LoadComponent, DarkModeToggleComponent],
  exports: [
    LoadComponent,
    DarkModeToggleComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class CommonComponentsModule { }
