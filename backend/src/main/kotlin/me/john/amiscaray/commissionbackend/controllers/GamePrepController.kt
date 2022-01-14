package me.john.amiscaray.commissionbackend.controllers

import me.john.amiscaray.commissionbackend.dto.ServerResponse
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.exceptions.InvalidGameSettingsException
import me.john.amiscaray.commissionbackend.exceptions.RoomNotFoundException
import me.john.amiscaray.commissionbackend.exceptions.UserNotFoundException
import me.john.amiscaray.commissionbackend.services.ActiveGameService
import me.john.amiscaray.commissionbackend.services.LobbyService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class GamePrepController(private val lobby: LobbyService, private val activeGameService: ActiveGameService) {

    @PostMapping("/request-new-game")
    fun requestNewGame(@RequestBody gameSettings: GameSettings): ResponseEntity<Any> {

        return try{
            val code = lobby.registerRoom(gameSettings)
            ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(code)
        }catch (error: InvalidGameSettingsException){
            ResponseEntity.badRequest()
                    .build()
        }

    }

    @GetMapping("/room/{roomCode}/player/{id}")
    fun getParticipantInfo(@PathVariable("roomCode") roomCode: String, @PathVariable("id") id: Long): ResponseEntity<Any>{

        return try{
            ResponseEntity.ok()
                    .body(lobby.getUserDetails(roomCode, id).toParticipantInfo())
        }catch(error: Exception){
            when(error){
                is RoomNotFoundException, is UserNotFoundException -> {
                    ResponseEntity
                            .notFound()
                            .build()
                }
                else -> {
                    /*
                     Assume that if the exception was not a room not found exception or user not found exception then
                     it must be a logic error
                     */
                    ResponseEntity
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .build()
                }
            }
        }

    }

    @GetMapping("/room/{roomCode}/exists")
    fun doesRoomExist(@PathVariable("roomCode") roomCode: String): ResponseEntity<Any>{

        return if(!lobby.roomExists(roomCode)){
            ResponseEntity
                    .notFound()
                    .build()
        }else if(activeGameService.gameIsActive(roomCode)){
            ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ServerResponse(ServerResponse.GAME_STARTED))
        }else if(lobby.roomFull(roomCode))
            ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(ServerResponse(ServerResponse.ROOM_FULL))
        else{
            ResponseEntity
                    .noContent()
                    .build()
        }

    }


}