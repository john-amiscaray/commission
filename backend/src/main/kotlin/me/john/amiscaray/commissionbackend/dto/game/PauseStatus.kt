package me.john.amiscaray.commissionbackend.dto.game

import java.util.concurrent.ConcurrentHashMap

data class PauseStatus(override val scores: ConcurrentHashMap<Long, Float>, override val matchWinner: Long,
                       override val type: GameStatusType, override val judge: Long, override val roundNumber: Int,
                       val leavingPlayers: MutableList<Long>, val playersHaveLeft: Boolean)
    : GameStatus(scores, matchWinner, type, judge, roundNumber) {




}