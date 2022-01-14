import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HostGamePage } from './host-game.page';

const routes: Routes = [
  {
    path: '',
    component: HostGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HostGamePageRoutingModule {}
