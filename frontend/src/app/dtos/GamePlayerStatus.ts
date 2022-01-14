export class GamePlayerStatus{

  constructor(public subject: number, public status: 'CONNECT' | 'DISCONNECT' ) {
  }

}

export class GamePlayerStatusType{

  static CONNECT = 'CONNECT'
  static DISCONNECT = 'DISCONNECT'

}
