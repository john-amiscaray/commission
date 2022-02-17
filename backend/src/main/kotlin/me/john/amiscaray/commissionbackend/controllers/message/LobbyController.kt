package me.john.amiscaray.commissionbackend.controllers.message

import me.john.amiscaray.commissionbackend.dto.lobby.LobbyStatus
import me.john.amiscaray.commissionbackend.exceptions.BadCredentialsException
import me.john.amiscaray.commissionbackend.services.ActiveGameService
import me.john.amiscaray.commissionbackend.services.JWTService
import me.john.amiscaray.commissionbackend.services.LobbyService
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.*
import org.springframework.stereotype.Controller

@Controller
class LobbyController(private val lobbyService: LobbyService, private val jwt: JWTService,
                      private val activeGameService: ActiveGameService) {

    private val logger = LoggerFactory.getLogger(LobbyController::class.java)

    @MessageMapping("/lobby/{roomCode}")
    @SendTo("/game-status/lobby/{roomCode}")
    fun getStatusOfGame(@Header(name="token") token: String, @Payload status: LobbyStatus, @DestinationVariable("roomCode") code: String): LobbyStatus {

        logger.info("[MESSAGE(${status.statusType}) from ${status.subject} with token: $token]")
        // If the room does not exist, send a message back to tell the player's client to leave
        if(!lobbyService.roomExists(code)){

            status.statusType = LobbyStatus.LobbyStatusType.KICK_PLAYER
            return status

        }

        var host = lobbyService.getRoomsConfigurations()[code]!!.host

        val expectedSender = if(status.statusType == LobbyStatus.LobbyStatusType.KICK_PLAYER){
            host
        }else{
            status.subject
        }

        if(!jwt.verifyJWTForTransaction(token, expectedSender, code)){
            throw BadCredentialsException()
        }

        // Get the game settings from the room to sync with the player
        val settings = lobbyService.getRoomsConfigurations()[code]!!.settings
        /*
         Get the participants to sync with the player as a set. This is to prevent duplicates if someone needs
         to reconnect after refreshing the page
         */
        val participants = lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap().keys()
                .toList()
                .toMutableSet()
        // Get the host to sync with the player

        if(status.statusType == LobbyStatus.LobbyStatusType.CONNECT){

            lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap()[status.subject] = false
            participants.add(status.subject)

            if(participants.size > settings.players){

                status.statusType = LobbyStatus.LobbyStatusType.KICK_PLAYER
                participants.removeIf { it != status.subject }
                lobbyService.removeParticipant(code, status.subject)

            }else{

                if(participants.size == 1){

                    lobbyService.getRoomsConfigurations()[code]!!.host = status.subject
                    status.host = status.subject
                    host = status.host

                }

            }


        }else if(status.statusType == LobbyStatus.LobbyStatusType.DISCONNECT){

            logger.info("A player has disconnected")
            lobbyService.removeParticipant(code, status.subject)
            if(lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap().keys().toList().isEmpty()){

                lobbyService.disbandRoom(code)
                logger.info("A room was disbanded")
                return status

            }
            // if the disconnecting subject is the host
            if(lobbyService.getRoomsConfigurations()[code]!!.host == status.subject){

                logger.info("Attempting to reassign the host of a room")
                val newHost = lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap()
                        .keys()
                        .toList()
                        .random()
                lobbyService.getRoomsConfigurations()[code]!!.host = newHost
                status.host = newHost

            }

        }else if(status.statusType == LobbyStatus.LobbyStatusType.READY){

            lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap()[status.subject] = true

        }else if(status.statusType == LobbyStatus.LobbyStatusType.NOT_READY){

            lobbyService.getRoomsConfigurations()[code]!!.getParticipantsReadyMap()[status.subject] = false

        }else if(status.statusType == LobbyStatus.LobbyStatusType.REQUEST_START){

            if(lobbyService.roomReady(code)){

                status.statusType = LobbyStatus.LobbyStatusType.START_GAME
                activeGameService.registerActiveGame(code, participants)

            }

        // TODO figure out why this message is being received twice from the front end
        }else if(status.statusType == LobbyStatus.LobbyStatusType.KICK_PLAYER){

            lobbyService.banUserFromRoom(status.subject, code)

        }

        // Sync the participants, host and settings just in case
        status.participants = participants.toMutableList()
        status.settings = settings
        status.host = host

        return status
    }

}