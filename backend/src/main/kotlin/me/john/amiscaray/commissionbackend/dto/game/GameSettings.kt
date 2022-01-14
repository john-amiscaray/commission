package me.john.amiscaray.commissionbackend.dto.game

class GameSettings(val players: Int, val seconds: Int, val rounds: Int) {

    // Need to override equals and hashcode or else a test fails. Why? I don't know, but this is dumb.
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as GameSettings

        if (players != other.players) return false
        if (seconds != other.seconds) return false
        if (rounds != other.rounds) return false

        return true
    }

    override fun hashCode(): Int {
        var result = players
        result = 31 * result + seconds
        result = 31 * result + rounds
        return result
    }
}