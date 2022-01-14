export class GameStatus{

  constructor(public scores: Map<number, number>, public matchWinner: number, public type: string,
              public judge: number, public roundNumber: number) {
  }



}

export class PauseStatus extends GameStatus{

  constructor(public type: 'GAME_PAUSE' | 'GAME_UNPAUSE',
              public judge: number, public roundNumber: number, public leavingPlayers: number[], public playersHaveLeft: boolean) {
    super(null, -1, type, judge, roundNumber);
  }

}

export class GameStatusType{

  static MATCH_START = 'MATCH_START'
  static MATCH_END = 'MATCH_END'
  static TEN_SECONDS = 'TEN_SECONDS'
  static JUDGED = 'JUDGED'
  static GAME_END = 'GAME_END'
  static GAME_PAUSE = 'GAME_PAUSE'
  static GAME_UNPAUSE = 'GAME_UNPAUSE'

}

