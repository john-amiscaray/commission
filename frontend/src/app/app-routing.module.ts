import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'game',
    loadChildren: () => import('./modules/game/game.module').then(m => m.GamePageModule)
  },
  {
    path: 'host-game',
    loadChildren: () => import('./modules/host-game/host-game.module').then(m => m.HostGamePageModule)
  },
  {
    path: 'lobby',
    loadChildren: () => import('./modules/lobby/lobby.module').then(m => m.LobbyPageModule)
  },
  {
    path: 'join-game',
    loadChildren: () => import('./modules/join-game/join-game.module').then( m => m.JoinGamePageModule)
  },
  {
    path: 'error',
    loadChildren: () => import('./modules/error/error.module').then( m => m.ErrorPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: "reload"
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
