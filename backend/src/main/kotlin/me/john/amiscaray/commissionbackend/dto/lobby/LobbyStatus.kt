package me.john.amiscaray.commissionbackend.dto.lobby

import me.john.amiscaray.commissionbackend.dto.game.GameSettings

data class LobbyStatus(var statusType: LobbyStatusType, val subject: Long,
                       var participants: MutableList<Long>, var settings: GameSettings, var host: Long) {

    enum class LobbyStatusType{

        CONNECT,
        DISCONNECT,
        READY,
        NOT_READY,
        KICK_PLAYER,
        START_GAME,
        REQUEST_START

    }

}