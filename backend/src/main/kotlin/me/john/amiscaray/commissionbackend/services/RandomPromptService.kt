package me.john.amiscaray.commissionbackend.services

import me.john.amiscaray.commissionbackend.exceptions.RoomNotFoundException
import me.john.amiscaray.commissionbackend.functions.SingleValueStringTemplate
import org.springframework.stereotype.Service

@Service
class RandomPromptService(internal val lobbyService: LobbyService) {

    private val promptTemplates: List<SingleValueStringTemplate> = listOf(
            SingleValueStringTemplate { "$it's little secret" },
            SingleValueStringTemplate { "A portrait of $it" },
            SingleValueStringTemplate { "$it's dream vacation" },
            SingleValueStringTemplate { "What $it does on their alone time" }
    )

    @Throws(RoomNotFoundException::class)
    fun generateRandomPromptForRoomWithSingleName(roomCode: String): String{

        if(!lobbyService.roomExists(roomCode)){
            throw RoomNotFoundException(roomCode)
        }
        val randomSubject = lobbyService.getRoomsConfigurations()[roomCode]!!.participantsInfo.keys().toList().random()
        val randomPlayerName = lobbyService.getUserDetails(roomCode, randomSubject).name

        return promptTemplates.random().with(randomPlayerName)

    }

}