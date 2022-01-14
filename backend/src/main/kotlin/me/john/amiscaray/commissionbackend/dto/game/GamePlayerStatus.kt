package me.john.amiscaray.commissionbackend.dto.game

data class GamePlayerStatus(val subject: Long, val status: GamePlayerStatusType) {

    enum class GamePlayerStatusType{

        CONNECT,
        DISCONNECT

    }

}