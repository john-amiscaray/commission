// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {EnvironmentVariables} from "./environment-variables";

export const environment: EnvironmentVariables = {
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


};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
