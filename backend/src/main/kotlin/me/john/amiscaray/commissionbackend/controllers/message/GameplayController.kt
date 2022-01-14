package me.john.amiscaray.commissionbackend.controllers.message

import me.john.amiscaray.commissionbackend.dto.game.*
import me.john.amiscaray.commissionbackend.services.ActiveGameService
import me.john.amiscaray.commissionbackend.services.AsyncMessageService
import me.john.amiscaray.commissionbackend.services.JWTService
import me.john.amiscaray.commissionbackend.services.LobbyService
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.*
import org.springframework.stereotype.Controller
import java.lang.IllegalArgumentException

@Controller
class GameplayController(private val activeGameService: ActiveGameService, private val messageService: AsyncMessageService,
                         private val jwt: JWTService){

    private val logger = LoggerFactory.getLogger(GameplayController::class.java)

    @MessageMapping("/actions/{roomCode}")
    @SendTo("/game-events/actions/{roomCode}")
    fun getGameActions(@Header(name="token") token: String, @Payload action: GameAction, @DestinationVariable("roomCode") code: String): GameAction {

        jwt.verifyJWTForTransaction(token, action.subject, code)

        if(action.canvas != action.subject){
            var score = activeGameService.getScoreOfPlayer(code, action.subject) ?: throw IllegalArgumentException("Must have a proper user")
            var penalty = (action.size * 0.5).toLong()
            if(penalty < 1){
                penalty = 1
            }
            score -= penalty
            if(score < 0){
                return GameAction(subject=action.subject, color="", from=action.from, to=action.to, canvas=action.canvas, size=0)
            }
            activeGameService.updateScoreOfPlayer(score=score, subject=action.subject, roomCode=code)

        }
        return action

    }

    @MessageMapping("/player/status/{roomCode}")
    @SendTo("/game-events/player/status/{roomCode}")
    fun getPlayerStatus(@Header(name="token") token: String, @Payload status: GamePlayerStatus, @DestinationVariable("roomCode") code: String): GamePlayerStatus {

        logger.info("${status.status} player ${status.subject}")

        jwt.verifyJWTForTransaction(token, status.subject, code)

        if(status.status == GamePlayerStatus.GamePlayerStatusType.CONNECT){
            activeGameService.updateConnectedStatusOfPlayer(true, status.subject, code)
            if(activeGameService.roomIsPaused(code) && activeGameService.allPlayersConnected(code)){
                activeGameService.unpauseTasksForRoom(code)
            }
        }else if(status.status == GamePlayerStatus.GamePlayerStatusType.DISCONNECT){
            activeGameService.updateConnectedStatusOfPlayer(false, status.subject, code)
            if(!activeGameService.roomIsPaused(code)){
                val room = activeGameService.getRoomGameDetails(code)
                messageService.sendMessageTo(messageService.getSendGameStatusEndpoint(code),
                        PauseStatus(scores=room.scores, matchWinner=-1,
                                type=GameStatus.GameStatusType.GAME_PAUSE,
                                judge=activeGameService.getJudgeOfRoom(code), roundNumber=room.roundsPlayed,
                                leavingPlayers=activeGameService.getRoomGameDetails(code).playerConnected.filter {
                                    !it.value
                                }.keys.toMutableList(), false))
            }
            activeGameService.pauseTasksForRoomUntilGracePeriod(code, status.subject)
        }
        return status

    }

    @MessageMapping("/judge/{roomCode}")
    @SendTo("/game-events/judge/{roomCode}")
    fun getJudgeActions(@Header(name="token") token: String, @Payload judgeAction: JudgeAction, @DestinationVariable("roomCode") code: String): JudgeAction{

        if(activeGameService.getJudgeOfRoom(code) != judgeAction.subject){
            throw IllegalAccessException("Player is not the judge")
        }

        jwt.verifyJWTForTransaction(token, judgeAction.subject, code)

        val roomGameDetails = activeGameService.getRoomGameDetails(code)

        if(judgeAction.type == JudgeAction.JudgeActionType.CHOSE_SOMETHING_TO_DRAW){

            activeGameService.cancelRandomPromptForRoomIfExists(code)
            activeGameService.prepareMatchEndForRoom(code)

        }else if (judgeAction.type == JudgeAction.JudgeActionType.JUDGED){

            activeGameService.cancelRandomWinnerForRoomIfExists(code)
            activeGameService.tryStartNextRoundOrEndGame(code, roomGameDetails, judgeAction)

        }

        return judgeAction

    }

}