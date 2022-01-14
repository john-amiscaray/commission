export class GameAction{

  constructor(public subject: number, public color: string, public size: number,
              public to: {x: number, y: number}, public from: {x: number, y: number}, public canvas: number) { }

}
