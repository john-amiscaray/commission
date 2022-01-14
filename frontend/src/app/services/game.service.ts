import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";
import {GameAction} from "../dtos/GameAction";
import {GameStatus} from "../dtos/GameStatus";
import {GameScoreUpdate} from "../dtos/GameScoreUpdate";
import {GamePlayerStatus, GamePlayerStatusType} from "../dtos/GamePlayerStatus";
import {GameJudgeAction} from "../dtos/GameJudgeAction";
import {RxStomp} from "@stomp/rx-stomp";
import {environment} from "../../environments/environment";
import {GameSettings} from "../dtos/GameSettings";
import {UserLobbyStatus} from "../dtos/UserLobbyStatus";
import {Subscription} from "rxjs";
import * as SockJS from "sockjs-client";

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private gameActionCallbacks: Array<(action: GameAction) => void> = [];
  private gameStatusCallbacks: Array<(action: GameStatus) => void> = [];
  private gameScoreCallbacks: Array<(action: GameScoreUpdate) => void> = [];
  private gamePlayerUpdateCallbacks: Array<(action: GamePlayerStatus) => void> = [];
  private gameJudgeActionCallbacks: Array<(action: GameJudgeAction) => void> = [];
  private rxStompClient: RxStomp;
  private _roomCode: string;
  private _settings: GameSettings;
  private _inActiveGame: boolean = false;
  private subscriptions: Subscription[] = [];
  private _connectedPlayerCount = 0;
  public participants: Array<number> = null;
  private _userConnectedStatus: Map<number, UserLobbyStatus>;
  private _gameActive: boolean = false;

  constructor(private auth: AuthService) { }

  public get settings(){

    return this._settings;

  }

  public get connectedPlayerCount(){

    return this._connectedPlayerCount;

  }

  public get userConnectedStatus(){
    return this._userConnectedStatus;
  }

  public get inActiveGame(){

    return this._inActiveGame

  }

  public get gameActive(){

    return this._gameActive

  }

  init(roomCode: string, settings: GameSettings,
       connectedStatus: Map<number, UserLobbyStatus>, participants: Array<number>){

    let self = this;
    this._roomCode = roomCode;
    this.participants = participants;

    this.rxStompClient = new RxStomp();
    this.rxStompClient.configure({
      webSocketFactory: function (){
        return new SockJS(environment.sockJSEndpoint);
      }

    });
    this.rxStompClient.activate();

    this._settings = settings;
    this._userConnectedStatus = connectedStatus;

    this.subscriptions.push(
      this.rxStompClient.watch({destination: environment.getGameActionReceiveEndpoint(this._roomCode)})
      .subscribe(res => {
        let body = JSON.parse(res.body) as GameAction;
        for(let callback of self.gameActionCallbacks){
          callback(body);
        }

      }, error => {

        console.error(error);

      }));

    this.subscriptions.push(
      this.rxStompClient.watch({destination: environment.getGameStatusUpdateEndpoint(this._roomCode)})
      .subscribe(res => {

        let body = JSON.parse(res.body) as GameStatus;
        let count = 0;
        for(let prop in body.scores as Object){
          count++;
        }
        if(count !== this._connectedPlayerCount){
          this._connectedPlayerCount = count;
        }

        for(let callback of self.gameStatusCallbacks){
          callback(body);
        }

      }, error => {

        console.log(error);

      }));

    this.subscriptions.push(
      this.rxStompClient.watch({destination: environment.getGameScoreUpdateEndpoint(this._roomCode)})
      .subscribe(res => {

        let body = JSON.parse(res.body) as GameScoreUpdate;

        for(let callback of self.gameScoreCallbacks){

          callback(body);

        }

      }, error => {

        console.log(error);

      }));

    this.subscriptions.push(
      this.rxStompClient.watch({destination: environment.getGamePlayerUpdateReceiveEndpoint(this._roomCode)})
      .subscribe(res => {

        let body = JSON.parse(res.body) as GamePlayerStatus;

        self.userConnectedStatus.get(body.subject).ready = body.status === GamePlayerStatusType.CONNECT;

        if(!this.participants.includes(body.subject) && body.status === 'CONNECT'){

          this.participants.push(body.subject);

        }else if(this.participants.includes(body.subject) && body.status === 'DISCONNECT'){

          this.participants = this.participants.filter(it => it != body.subject);

        }

        for(let callback of self.gamePlayerUpdateCallbacks){

          callback(body);

        }

      }, error => {

        console.log(error);

      }));

    this.subscriptions.push(
      this.rxStompClient.watch({destination: environment.getGameJudgeActionReceiveEndpoint(this._roomCode)})
      .subscribe(res => {

        let body = JSON.parse(res.body) as GameJudgeAction;

        for(let callback of self.gameJudgeActionCallbacks){

          callback(body);

        }

      }));
    this._inActiveGame = true;

  }

  // ADD CALLBACKS

  addGameActionCallback(callback: (action: GameAction) => void){

    this.gameActionCallbacks.push(callback);

  }

  addGameStatusCallback(callback: (status: GameStatus) => void){

    this.gameStatusCallbacks.push(callback);

  }

  addGameScoreCallback(callback: (score: GameScoreUpdate) => void){

    this.gameScoreCallbacks.push(callback);

  }

  addGamePlayerUpdateCallback(callback: (status: GamePlayerStatus) => void){

    this.gamePlayerUpdateCallbacks.push(callback);

  }

  addJudgeActionCallback(callback: (action: GameJudgeAction) => void){

    this.gameJudgeActionCallbacks.push(callback);

  }

  // SEND MESSAGES

  sendGameAction(action: GameAction){

    let self = this;

    this.rxStompClient.publish({
      destination: environment.getGameActionSendEndpoint(self._roomCode),
      body: JSON.stringify(action),
      headers: {
        token: self.auth.getJWT()
      }
    });
  }

  sendGamePlayerStatus(status: GamePlayerStatus){

    let self = this;
    this.rxStompClient.publish({
      destination: environment.getGamePlayerUpdateSendEndpoint(self._roomCode),
      body: JSON.stringify(status),
      headers: {
        token: self.auth.getJWT()
      }
    })

  }

  sendJudgeAction(action: GameJudgeAction){

    let self = this;
    action.subject = parseInt(this.auth.getGameId());
    this.rxStompClient.publish({
      destination: environment.getGameJudgeActionSendEndpoint(self._roomCode),
      body: JSON.stringify(action),
      headers: {
        token: self.auth.getJWT()
      }
    })

  }

  // CLEAN UP

  private clearCallbacks(){

    this.gameJudgeActionCallbacks = [];
    this.gameScoreCallbacks = [];
    this.gameActionCallbacks = [];
    this.gameStatusCallbacks = [];

  }

  private unsubscribeAll(){

    for(let subscription of this.subscriptions){

      subscription.unsubscribe();

    }

  }

  clearResourcesOnComplete(){

    this.clearCallbacks();
    this.unsubscribeAll();
    this.rxStompClient.deactivate();

  }

}
