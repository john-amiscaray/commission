package me.john.amiscaray.commissionbackend.dto.lobby

import me.john.amiscaray.commissionbackend.dto.game.GameSettings

data class LobbyStatus(var statusType: LobbyStatusType, val subject: Long,
                       var participants: MutableList<Long>, var settings: GameSettings, var host: Long) {


    constructor() : this(LobbyStatusType.DISCONNECT, -1, mutableListOf(), GameSettings(3, 30, 3), -1){



    }

    enum class LobbyStatusType{

        CONNECT,
        DISCONNECT,
        READY,
        NOT_READY,
        KICK_PLAYER,
        START_GAME,
        REQUEST_START

    }

    override fun toString(): String {
        return "LobbyStatus(statusType=$statusType, subject=$subject, participants=$participants, settings=$settings, host=$host)"
    }

}