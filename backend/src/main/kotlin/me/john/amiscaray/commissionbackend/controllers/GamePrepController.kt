package me.john.amiscaray.commissionbackend.controllers

import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.exceptions.*
import me.john.amiscaray.commissionbackend.services.ActiveGameService
import me.john.amiscaray.commissionbackend.services.LobbyService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class GamePrepController(private val lobby: LobbyService, private val activeGameService: ActiveGameService) {

    @PostMapping("/request-new-game")
    fun requestNewGame(@RequestBody gameSettings: GameSettings): ResponseEntity<Any> {

        val code = lobby.registerRoom(gameSettings)
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(code)


    }

    @GetMapping("/room/{roomCode}/player/{id}")
    fun getParticipantInfo(@PathVariable("roomCode") roomCode: String, @PathVariable("id") id: Long): ResponseEntity<Any>{

            return ResponseEntity.ok()
                .body(lobby.getUserDetails(roomCode, id).toParticipantInfo())

    }

    @GetMapping("/room/{roomCode}/exists")
    fun doesRoomExist(@PathVariable("roomCode") roomCode: String): ResponseEntity<Void>{

        return if(!lobby.roomExists(roomCode)){
            throw RoomNotFoundException(roomCode)
        }else if(activeGameService.gameIsActive(roomCode)){
            throw GameStartedException(roomCode)
        }else if(lobby.roomFull(roomCode))
            throw RoomFullException(roomCode)
        else{
            ResponseEntity
                    .noContent()
                    .build()
        }

    }


}