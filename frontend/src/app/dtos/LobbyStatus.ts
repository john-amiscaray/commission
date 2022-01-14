import {GameSettings} from "./GameSettings";

export class LobbyStatus{

  constructor(public statusType: string, public subject: number, public host: number=-1,
              public participants: Array<number>=[], public settings: GameSettings=new GameSettings()) {
  }

}

export class LobbyStatusType{

  static CONNECT = 'CONNECT'
  static DISCONNECT = 'DISCONNECT'
  static READY = 'READY'
  static NOT_READY = 'NOT_READY'
  static KICK_PLAYER = 'KICK_PLAYER'
  static REQUEST_START = 'REQUEST_START'
  static START_GAME = 'START_GAME'

}
