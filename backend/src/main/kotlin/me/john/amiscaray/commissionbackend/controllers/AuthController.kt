package me.john.amiscaray.commissionbackend.controllers

import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.services.LobbyService
import me.john.amiscaray.commissionbackend.services.SessionIdService
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class AuthController(private val lobby: LobbyService, private val sessionIdService: SessionIdService) {

    private val logger = LoggerFactory.getLogger(AuthController::class.java)

    @GetMapping("/sessionId")
    fun getSessionId(): ResponseEntity<String> {

        return ResponseEntity.ok(sessionIdService.generateNewUUID().toString())

    }

    @DeleteMapping("/sessionId/{sessionId}")
    fun revokeSessionId(@PathVariable("sessionId") uuidAsString: String): ResponseEntity<Void> {

        sessionIdService.revokeUUID(uuidAsString)
        return ResponseEntity
                .noContent()
                .build()

    }

    @PostMapping("/room/{roomCode}/game-identity")
    @ResponseBody
    fun requestGameId(@PathVariable("roomCode") roomCode: String, @RequestBody identity: GameIdentity): ResponseEntity<GameIdentity>{

        return ResponseEntity.ok()
            .body(lobby.createGameId(roomCode, identity))

    }

    // This endpoint is only made for beacon requests so no response should come out. It is POST only because beacon requests must be POST.
    @PostMapping(value=["/logout-details"])
    fun beaconLogOut(@RequestParam(name="uuid") uuid: String): String{

        logger.info("beacon request received")
        sessionIdService.revokeUUID(uuid)

        return ""

    }

}