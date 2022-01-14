package me.john.amiscaray.commissionbackend.exceptions

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

abstract class CommissionException(override val message: String): Exception(message)

@ResponseStatus(HttpStatus.NOT_FOUND)
class UserNotFoundException: CommissionException("The user was not found")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class InvalidGameSettingsException: CommissionException("Invalid game settings were given")

@ResponseStatus(HttpStatus.NOT_FOUND)
class RoomNotFoundException(roomCode: String): CommissionException("Room not found for room $roomCode")

@ResponseStatus(HttpStatus.UNAUTHORIZED)
class BadCredentialsException: CommissionException("The user's credentials were found to be invalid")

@ResponseStatus(HttpStatus.NOT_FOUND)
class UUIDNotFoundException(uuid: String): CommissionException("The given uuid was not found for uuid $uuid")

@ResponseStatus(HttpStatus.FORBIDDEN)
class ForbiddenRoomException(uuid: String, roomCode: String): CommissionException("The user with uuid $uuid was banned from room $roomCode")