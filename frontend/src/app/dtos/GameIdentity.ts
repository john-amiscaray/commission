export class GameIdentity{

  constructor(public id: number, public pfp: string, public name: string, public uuid: string,
              public token: string = '', public room: string = '') {
  }

}

export class ParticipantInfo{

  constructor(public id: number, public pfp: string, public name: string, public room: string = '') {
  }

}
