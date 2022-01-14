package me.john.amiscaray.commissionbackend.dto.game

data class GameAction(val subject: Long, val color: String, val size: Int, val to: Location, val from: Location, val canvas: Long)