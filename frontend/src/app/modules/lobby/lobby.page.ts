import {LobbyService} from "../../services/lobby.service";
import {LobbyStatus, LobbyStatusType} from "../../dtos/LobbyStatus";
import {AuthService} from "../../services/auth.service";
import {UserLobbyStatus} from "../../dtos/UserLobbyStatus";
import {GameSettings} from "../../dtos/GameSettings";
import {ToastService} from "../../services/toast.service";
import {Router} from "@angular/router";
import {Component, HostListener, OnInit} from "@angular/core";
import {ProfilePictureService} from "../../services/profile-picture.service";
import {ComponentWithSplashIntro} from "../../component-interfaces/component-with-splash-intro";
import {IonSelect, Platform} from "@ionic/angular";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage extends ComponentWithSplashIntro implements OnInit{

  public participants: Map<number, UserLobbyStatus> = new Map<number, UserLobbyStatus>();
  public isHost: boolean = false;
  public loadingLobby = true;

  constructor(public lobby: LobbyService, private auth: AuthService, private platform: Platform,
              private toast: ToastService, private router: Router, public pfp: ProfilePictureService) {
    super();
  }

  ngOnInit(){

    // if(!this.lobby.connectedToLobby() && !this.auth.getRoomCode()){
    //
    //   this.router.navigate(['home']);
    //
    // }

  }

  private lobbyInit(){

    let self = this;
    this.isHost = false;
    this.participants = new Map<number, UserLobbyStatus>();
    this.lobby.addLobbyStatusCallback((status: LobbyStatus) => {
      if(status.host != -1){

        if(status.host === parseInt(self.auth.getGameId())){
          self.isHost = true;
        }

      }

      if(status.statusType === LobbyStatusType.CONNECT){

        console.log(`CONNECT[${status.subject}]`);
        if(status.participants != null && JSON.stringify(Array.from(self.participants.keys()))
          !== JSON.stringify(status.participants)){
          for(let id of status.participants){
            self.auth.getUserInfo(self.lobby.roomCode, id).subscribe(res => {

              self.participants.set(id, {user: res, ready: false});

            });
          }
        }
      }else if(status.statusType === LobbyStatusType.READY){

        self.participants.get(status.subject).ready = true;

      }else if(status.statusType === LobbyStatusType.NOT_READY){

        self.participants.get(status.subject).ready = false;

      }else if(status.statusType === LobbyStatusType.KICK_PLAYER
        || status.statusType === LobbyStatusType.DISCONNECT){

        console.log(`DISCONNECT[${status.subject}]`);
        if(self.isMyId(status.subject)){

          self.lobby.leaveLobby();
          self.router.navigate([''])
            .then(() => {
              if(status.statusType === LobbyStatusType.KICK_PLAYER){
                self.toast.customToastMessage('You have been kicked from the server');
              }
            });
        }else{

          self.participants.delete(status.subject);

        }

      }else if(status.statusType === LobbyStatusType.START_GAME){

        self.lobby.startGame(this.participants);
        self.router.navigate(['game']);

      }

    });
    this.startConnection();

  }

  ionViewDidEnter(){

    setTimeout(() => {
      try{
        if(!this.lobby.connectedToLobby()){
          console.log("Trying to restore the game");
          this.participants = new Map<number, UserLobbyStatus>();
          this.lobby.tryRestoreGameOrLeave((res) => {
            console.log(`The new game id is: ${JSON.stringify(res)}`);
            this.lobbyInit();
          });
        }else{
          this.lobbyInit();
        }
        this.loadingLobby = false;
      }catch (e){
        console.log(e);
        this.toast.customToastMessage('failed to join lobby, please try again');
      }
    }, 3000);

  }

  ionViewDidLeave(){

    this.participants = new Map<number, UserLobbyStatus>();
    this.isHost = false;
    this.loadingLobby = true;

  }

  startConnection(){

    // A little hacky but too bad!
    this.lobby.sendStatusMessage(new LobbyStatus(LobbyStatusType.CONNECT, parseInt(this.auth.getGameId()), -1,[],
      new GameSettings()));

  }

  leave(){

    this.router.navigate(['join-game']).then(_ => {
      this.lobby.leaveLobby();
    });

  }

  isMyId(id: number){

    return id === parseInt(this.auth.getGameId());

  }

  toggleReady(){

    let me = this.participants.get(parseInt(this.auth.getGameId()));

    if(me.ready){

      this.lobby.sendStatusMessage(new LobbyStatus(LobbyStatusType.NOT_READY, parseInt(this.auth.getGameId())));

    }else{

      this.lobby.sendStatusMessage(new LobbyStatus(LobbyStatusType.READY, parseInt(this.auth.getGameId())));

    }

  }

  allPlayersReady(){

    for(let player of this.participants.values()){

      if(!player.ready){
        return false;
      }

    }

    return true;

  }

  getLobbyStatusText(): string{

    if(!this.lobby.settings){
      return 'loading...';
    }

    if(this.participants.size === this.lobby.settings.players){
      if(this.allPlayersReady()){
        return 'Waiting for host to start game';
      }else{
        return 'Waiting for everyone to ready up';
      }
    }else {
      return 'Waiting for enough players';
    }

  }

  onBanSelection(selector: IonSelect){

    this.lobby.kickPlayer(selector.value);
    selector.value = null;

  }

  @HostListener('window:beforeunload')
  beforeUnload() {
    this.loadingLobby = true;
  }

}
