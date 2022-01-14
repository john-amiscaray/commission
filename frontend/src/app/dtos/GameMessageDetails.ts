export class GameMessageDetails{

  constructor(public heading: string, public message: string, public messageType: string,
              public isJudge: boolean, public judgeRequest: string,
              public drawingUrlMap: Map<number, string>, public dismissible: boolean){ }

}
