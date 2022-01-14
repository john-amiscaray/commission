export interface EnvironmentVariables{

  production: boolean
  backEndUrl: string
  apiUrl: string
  sockJSEndpoint: string
  getLobbyStatusSendEndpoint: (gameCode: string) => string
  getLobbyStatusReceiveEndpoint: (gameCode: string) => string
  serverSocketErrorMessages: {
    roomNotFound: string
  },
  getGameActionReceiveEndpoint: (gameCode: string) => string
  getGameActionSendEndpoint: (gameCode: string) => string

  getGameScoreUpdateEndpoint: (gameCode: string) => string
  getGameStatusUpdateEndpoint: (gameCode: string) => string

  getGamePlayerUpdateSendEndpoint: (gameCode: string) => string
  getGamePlayerUpdateReceiveEndpoint: (gameCode: string) => string

  getGameJudgeActionSendEndpoint: (gameCode: string) => string
  getGameJudgeActionReceiveEndpoint: (gameCode: string) => string

  /*
  production: false,
  backEndUrl: "http:localhost:8080/",
  apiUrl: "http://localhost:8080/api",
  sockJSEndpoint: "http://localhost:8080/api/stomp",
  getLobbyStatusSendEndpoint: (gameCode: string) => {return `/game/lobby/${gameCode}`},
  getLobbyStatusReceiveEndpoint: (gameCode: string) => {return `/game-status/lobby/${gameCode}`},
  serverSocketErrorMessages: {
    roomNotFound: 'The room was not found'
  },
  getGameActionReceiveEndpoint: (gameCode: string) => {return `/game-events/actions/${gameCode}`},
  getGameActionSendEndpoint: (gameCode: string) => {return `/game/actions/${gameCode}`},

  getGameScoreUpdateEndpoint: (gameCode: string) => {return `/game-events/score/${gameCode}`},
  getGameStatusUpdateEndpoint: (gameCode: string) => {return `/game-events/status/${gameCode}`},

  getGamePlayerUpdateSendEndpoint: (gameCode: string) => {return `/game/player/status/${gameCode}`},
  getGamePlayerUpdateReceiveEndpoint: (gameCode: string) => {return `/game-events/player/status/${gameCode}`},

  getGameJudgeActionSendEndpoint: (gameCode: string) => {return `/game/judge/${gameCode}`},
  getGameJudgeActionReceiveEndpoint: (gameCode: string) => {return `/game-events/judge/${gameCode}`}
   */

}
