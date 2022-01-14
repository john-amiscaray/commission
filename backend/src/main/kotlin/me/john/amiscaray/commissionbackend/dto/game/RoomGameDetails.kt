package me.john.amiscaray.commissionbackend.dto.game

import me.john.amiscaray.commissionbackend.models.Event
import java.util.*
import java.util.concurrent.ConcurrentHashMap

data class RoomGameDetails(val scores: ConcurrentHashMap<Long, Float>, var playerConnected: ConcurrentHashMap<Long, Boolean>,
    var allConnected: Boolean=false, var judgeIndex: Int=0, var roundsPlayed: Int=0,
                           val scheduledGameEvents: Stack<Event> = Stack(), var isPaused: Boolean = false,
                           var hasStarted: Boolean = false, var judgeHasLeft: Boolean = false)