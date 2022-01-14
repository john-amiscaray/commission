export class GameJudgeAction{

  constructor(public subject: number, public drawing: string, public type: string, public winner: number) { }

}

export class GameJudgeActionType{

  static JUDGED = 'JUDGED'
  static CHOSE_SOMETHING_TO_DRAW = 'CHOSE_SOMETHING_TO_DRAW'

}
