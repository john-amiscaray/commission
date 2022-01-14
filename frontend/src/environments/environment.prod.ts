import {EnvironmentVariables} from "./environment-variables";

export const environment: EnvironmentVariables = {
  production: true,
  backEndUrl: "https://secret-temple-05728.herokuapp.com/",
  apiUrl: "https://secret-temple-05728.herokuapp.com/api",
  sockJSEndpoint: "https://secret-temple-05728.herokuapp.com/api/stomp",
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


};
