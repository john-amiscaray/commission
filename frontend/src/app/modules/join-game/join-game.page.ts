import { Component } from '@angular/core';
import {LobbyService} from "../../services/lobby.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ToastService} from "../../services/toast.service";
import {HTTP_STATUS} from "../../constants/Constants";
import {ServerResponse} from "../../dtos/ServerResponse";

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.page.html',
  styleUrls: ['./join-game.page.scss'],
})
export class JoinGamePage {

  loadingGame: boolean = false;

  constructor(private lobby: LobbyService, private router: Router,
              private auth: AuthService, private toast: ToastService) { }

  ionViewDidEnter(){

    if(!this.auth.hasValidProfile()){
      this.router.navigate(['profile']);
      this.auth.presentBadProfileError();
    }

  }

  ionViewDidLeave(){

    this.loadingGame = false;

  }

  joinGame(roomCode: string){

    let self = this;
    this.loadingGame = true;

    this.lobby.roomExists(roomCode).subscribe(_ => {
      this.lobby.joinRoom(roomCode, _ => {

          self.router.navigate(['lobby']);

      }, _ => {

        self.router.navigate(['home']).then(_ => {

          self.toast.customToastMessage('An unexpected error occurred when trying to join the game please send a bug report');

        });

      });

    }, error => {

      // Set time out just so the spinner isn't gone immediately; the response comes back pretty quick.
      setTimeout(() => {
        let message: string = 'An unexpected error occurred. Please try again later or send a bug report.';
        let body: ServerResponse = error.error as ServerResponse;
        if(body){
          message = body.message;
        }else if(error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR){
          message = ServerResponse.SERVER_ERROR;
        }else if(error.status === HTTP_STATUS.NOT_FOUND){
          message = ServerResponse.NOT_FOUND('room');
        }
        self.toast.customToastMessage(message);
        self.loadingGame = false;
      }, 1000);

    })

  }

}
