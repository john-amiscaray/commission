import {EnvironmentVariables} from "./environment-variables";

export const environment: EnvironmentVariables = {
  production: true,
  backEndUrl: "https://commission-backend.herokuapp.com/",
  apiUrl: "https://commission-backend.herokuapp.com/api",
  sockJSEndpoint: "https://commission-backend.herokuapp.com/api/stomp",
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
