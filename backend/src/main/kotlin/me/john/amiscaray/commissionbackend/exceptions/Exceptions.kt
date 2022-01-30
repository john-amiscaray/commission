package me.john.amiscaray.commissionbackend.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

abstract class CommissionException(override val message: String): RuntimeException(message)

@ResponseStatus(HttpStatus.NOT_FOUND, reason="The user was not found")
class UserNotFoundException: CommissionException("The user was not found")

@ResponseStatus(HttpStatus.BAD_REQUEST, reason="Invalid game settings were given")
class InvalidGameSettingsException: CommissionException("Invalid game settings were given")

@ResponseStatus(HttpStatus.NOT_FOUND, reason="Room not found")
class RoomNotFoundException(roomCode: String): CommissionException("Room not found for room $roomCode")

@ResponseStatus(HttpStatus.UNAUTHORIZED, reason="Your credentials were found to be invalid")
class BadCredentialsException: CommissionException("The user's credentials were found to be invalid")

@ResponseStatus(HttpStatus.NOT_FOUND, reason="Your UUID was not found")
class UUIDNotFoundException(uuid: String): CommissionException("The given uuid was not found for uuid $uuid")

@ResponseStatus(HttpStatus.FORBIDDEN, reason="You were banned from this room")
class ForbiddenRoomException(uuid: String, roomCode: String): CommissionException("The user with uuid $uuid was banned from room $roomCode")

@ResponseStatus(HttpStatus.CONFLICT, reason="The game you are attempting to join has already started")
class GameStartedException(roomCode: String): CommissionException("The room $roomCode is already in a game")

@ResponseStatus(HttpStatus.CONFLICT, reason="The room you are attempting to join is full")
class RoomFullException(roomCode: String): CommissionException("The room $roomCode is full")