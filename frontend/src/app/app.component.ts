import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {LobbyService} from "./services/lobby.service";
import {Router} from "@angular/router";
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import {ToastService} from "./services/toast.service";
import {GameService} from "./services/game.service";
import {HttpClient} from "@angular/common/http";

const { App, BackgroundTask } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit{

  constructor(public auth: AuthService, public lobby: LobbyService, private game: GameService,
              public router: Router, private platform: Platform,
              private toast: ToastService) {}

  ngOnInit() {
    if(this.platform.is('mobile') && !this.platform.is('mobileweb')){
      let self = this;
      App.addListener('appStateChange', state => {
        if (!state.isActive) {
          let taskId = BackgroundTask.beforeExit(async () => {
            console.log(`This is the thing you are looking for: ${this.lobby.connectedToLobby()} | ${this.game.inActiveGame}`);
            if(this.lobby.connectedToLobby()){
              this.lobby.leaveLobby();
            }else if(this.game.inActiveGame){
              this.disconnectFromGame();
            }else{
              this.auth.resetUUID();
            }
            BackgroundTask.finish({
              taskId,
            });
          });
        }else{
          if(this.lobby.connectedToLobby() && this.router.url === '/lobby') {
            this.lobby.joinRoom(this.lobby.roomCode, (_) => {
              location.reload();
            }, e => {
              this.router.navigate(['']).then(() => {
                self.toast.customToastMessage('failed to restore the game. Please try again or start a new one');
                console.log(e);
              });
            });
          }else if(this.router.url === '/game' && this.game.inActiveGame){
            this.reconnectToGame();
          }else{
            this.auth.generateAndSaveUUID();
          }
        }
      });
    }

    this.auth.generateAndSaveUUID();


  }

  onUnload(){
    // Do nothing if the platform is mobile because this is handled by the background task above
    if(this.platform.is('mobile')){
      return;
    }
    console.log('unload');
    if(this.lobby.connectedToLobby()){
      this.lobby.leaveLobby();
      this.auth.resetUUID();
    }else if(this.game.inActiveGame){
      this.disconnectFromGame();
    }else{
      this.auth.resetUUID();
    }

  }

  private disconnectFromGame(){

    let self = this;

    this.game.sendGamePlayerStatus({
      subject: parseInt(self.auth.getGameId()),
      status: 'DISCONNECT'
    });

  }

  private reconnectToGame(){

    let self = this;

    this.game.sendGamePlayerStatus({
      subject: parseInt(self.auth.getGameId()),
      status: 'CONNECT'
    });

  }

}
