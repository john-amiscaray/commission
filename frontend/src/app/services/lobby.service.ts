import {HostListener, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {AuthService} from "./auth.service";
import {ToastService} from "./toast.service";
import {LobbyStatus, LobbyStatusType} from "../dtos/LobbyStatus";
import {HttpClient} from "@angular/common/http";
import {RxStomp} from "@stomp/rx-stomp";
import * as SockJS from 'sockjs-client';
import {GameSettings} from "../dtos/GameSettings";
import {Subscription} from "rxjs";
import {GameService} from "./game.service";
import {GameIdentity} from "../dtos/GameIdentity";
import {ProfilePictureService} from "./profile-picture.service";
import {UserLobbyStatus} from "../dtos/UserLobbyStatus";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private _roomCode: string = null;
  private _participants: Array<number> = [];
  private readonly rxStompClient: RxStomp;
  private _settings: GameSettings;
  private lobbyStatusCallbacks: Array<(status: LobbyStatus) => void> = [];
  private lobbySubscription: Subscription;

  constructor(private auth: AuthService, private toast: ToastService, private router: Router,
              private http: HttpClient, private game: GameService, private pfp: ProfilePictureService) {

    this.rxStompClient = new RxStomp();

  }

  public get participants(){

    return this._participants;

  }

  roomExists(roomCode: String){

    return this.http.get(`${environment.apiUrl}/room/${roomCode}/exists`);

  }

  configureTestSettings(){

    this._roomCode = 'test';
    this._participants = [parseInt(this.auth.getGameId()), 420, 69, 12];
    this._settings = new GameSettings(3);
    this.rxStompClient.configure({
      webSocketFactory: function (){
        return new SockJS(environment.sockJSEndpoint);
      }

    });
    this.rxStompClient.activate();

  }

  public get settings(){

    return this._settings;

  }

  public get roomCode(){

    return this._roomCode;

  }

  resetGameCode(){

    this._roomCode = null;
    this.auth.resetRoomCode();

  }

  connectedToLobby(){

    console.log(this.roomCode)
    return this.roomCode !== null && !this.game.inActiveGame

  }

  leaveLobby(){

    if(!this.connectedToLobby()){
      return
    }
    this.sendStatusMessage(new LobbyStatus(LobbyStatusType.DISCONNECT, parseInt(this.auth.getGameId())));
    this.rxStompClient.deactivate();
    this.unSubscribeFromLobby();
    this._settings = null;
    this._roomCode = null;
    // If we left at the lobby page, then we keep the lobby code to try to restore the game later
    if(this.router.url !== '/lobby'){
      this.resetGameCode();
    }else{
      console.log('-------Stored the game stuff for safety-------')
    }
    console.log(`-------left game from ${this.router.url} |  ${this.router.url === '/lobby'}-------`);

  }

  tryRestoreGameOrLeave(onSuccess: (gameIdentity) => void = _ => {}){

    this._roomCode = this.auth.getRoomCode();
    let self = this;
    try{
      this.auth.generateAndSaveUUID(() => {
        this.joinRoom(this._roomCode, onSuccess);
      });
    }catch(e){
      self.leaveLobby();
      self.router.navigate(['home']).then(() => {
        self.toast.customToastMessage('Failed to restore the game. Please start a new one');
      });
    }

  }

  requestLobbyStart(gameSettings: GameSettings, roomCodeCallBack: Function, errorCallback: (e: Error) => void= () => {  }){

    let self = this;
    this._settings = gameSettings;

    this.http.post(`${environment.apiUrl}/request-new-game`, gameSettings, {headers: {
        'Accept': 'text/plain'
      }, responseType: 'text'})
      .subscribe(res => {

       self.joinRoom(res, roomCodeCallBack, errorCallback);

      }, error => {

        self.toast.failureToast();
        errorCallback(error);

      });

  }

  registerGameId(roomCode: string){

    return this.http.post<GameIdentity>(`${environment.apiUrl}/room/${roomCode}/game-identity`,
      new GameIdentity(-1, this.pfp.getProfilePicture(), this.auth.getName(), this.auth.getUUID()));
  }

  joinRoom(roomCode: string, gameIdentityCallback: Function, errorCallback: (e: Error) => void =
      e => { console.log(e); }){

    this.registerGameId(roomCode)
      .subscribe((res: GameIdentity) => {
        this._roomCode = roomCode;
        this.auth.setGameId(res.id);
        this.auth.setRoomCode(roomCode);
        this.auth.setJWT(res.token);
        this.establishConnection();
        gameIdentityCallback(res);
      }, errorCallback);
  }

  establishConnection(){

    let self = this;

    this.rxStompClient.configure({
      webSocketFactory: function (){
        return new SockJS(environment.sockJSEndpoint);
      }

    });
    this.rxStompClient.activate();
    this.lobbySubscription = this.rxStompClient.watch({
      destination: environment.getLobbyStatusReceiveEndpoint(self._roomCode)
    })
      .subscribe(res => {

        let body = JSON.parse(res.body) as LobbyStatus;
        if(body.settings != self._settings){
          self._settings = body.settings;
          console.log(`--------The settings are ${JSON.stringify(self._settings)}--------`);
        }
        if(body.statusType === LobbyStatusType.CONNECT){
          self._participants = body.participants;
        }
        for(let gameStatusCallBack of this.lobbyStatusCallbacks){
          gameStatusCallBack(body);
        }

      }, error => {
        console.log(error);
      });


  }

  addLobbyStatusCallback(callback: (status: LobbyStatus) => void){

    this.lobbyStatusCallbacks.push(callback);

  }

  kickPlayer(id: number){

    this.sendStatusMessage(new LobbyStatus(LobbyStatusType.KICK_PLAYER, id));

  }

  requestStart(){

    this.sendStatusMessage(new LobbyStatus(LobbyStatusType.REQUEST_START, parseInt(this.auth.getGameId())));

  }

  resetLobbyCallbacks(){

    this.lobbyStatusCallbacks = [];

  }

  unSubscribeFromLobby(){

    if(this.lobbySubscription){

      this.lobbySubscription.unsubscribe();

    }

    this.resetLobbyCallbacks();

  }

  sendStatusMessage(action: LobbyStatus){

    let self = this;
    this.rxStompClient.publish({
      destination: environment.getLobbyStatusSendEndpoint(self._roomCode),
      body: JSON.stringify(action),
      headers: {
        token: self.auth.getJWT()
      }
    });

  }

  // START GAME

  startGame(lobbyStatus: Map<number, UserLobbyStatus>){

    this.unSubscribeFromLobby();
    this.game.init(this.roomCode, this._settings, lobbyStatus, this.participants);

  }

}
