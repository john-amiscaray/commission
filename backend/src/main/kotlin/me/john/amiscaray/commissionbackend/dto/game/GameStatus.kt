package me.john.amiscaray.commissionbackend.dto.game

import java.util.concurrent.ConcurrentHashMap

open class GameStatus(open val scores: ConcurrentHashMap<Long, Float>, open val matchWinner: Long,
                      open val type: GameStatusType, open val judge: Long, open val roundNumber: Int){

    enum class GameStatusType{

        MATCH_START,
        MATCH_END,
        GAME_END,
        GAME_PAUSE,
        GAME_UNPAUSE

    }

}
