package me.john.amiscaray.commissionbackend.dto.auth

import me.john.amiscaray.commissionbackend.dto.game.ParticipantInfo

data class GameIdentity(var id: Long, val pfp: String, var uuid: String,
                   var name: String, var room: String, var token: String) {

    private val asParticipantInfo = ParticipantInfo(id, pfp, name, room)

    override fun toString(): String {
        return "$id@$room"
    }

    fun toParticipantInfo(): ParticipantInfo{
        return asParticipantInfo
    }

}