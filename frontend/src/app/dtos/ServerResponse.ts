export class ServerResponse{

  public readonly message: string;
  public static readonly ROOM_FULL: string = 'Room full.'
  public static readonly GAME_STARTED: string = 'The game you were looking for has started.'
  public static readonly SERVER_ERROR: string = 'Something happened with our server, we will try our best to fix it.'
  public static readonly NOT_FOUND: (subject: string) => string = subject => `Could not find the ${subject} you were looking for`

}
