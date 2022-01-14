import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LoadComponent} from "./load/load.component";
import {IonicModule} from "@ionic/angular";



@NgModule({
  declarations: [LoadComponent],
  exports: [
    LoadComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class CommonComponentsModule { }
