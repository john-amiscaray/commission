package me.john.amiscaray.commissionbackend.services

import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.dto.game.ParticipantInfo
import me.john.amiscaray.commissionbackend.dto.lobby.RoomConfiguration
import me.john.amiscaray.commissionbackend.exceptions.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap
import kotlin.random.Random

@Service
class LobbyService(private val jwt: JWTService, private val sessionIdService: SessionIdService) {

    private var roomConfigurationsMap: ConcurrentHashMap<String, RoomConfiguration> = ConcurrentHashMap()
    private val logger = LoggerFactory.getLogger(LobbyService::class.java)

    // TODO - create some mechanism to handle max room capacity (unlikely to happen any time soon but better safe than sorry)
    fun generateNewRoomCode(): String{

        var code = ""
        while(code.length < 4){

            for(i in 0 until 4){

                val next = Random.nextInt(65, 91)
                code += next.toChar()

            }

            if(code.length == 4){
                if(roomConfigurationsMap.contains(code)){
                    code = ""
                }
            }

        }
        return code

    }

    fun getRoomsConfigurations(): ConcurrentHashMap<String, RoomConfiguration> {
        return roomConfigurationsMap
    }

    @Throws(InvalidGameSettingsException::class)
    fun registerRoom(gameSettings: GameSettings): String{

        val code = generateNewRoomCode()
        if(!validateGameSettings(gameSettings)){
            throw InvalidGameSettingsException()
        }
        roomConfigurationsMap[code] = RoomConfiguration(gameSettings, ConcurrentHashMap(), -1, ConcurrentHashMap())

        return code

    }

    @Throws(RoomNotFoundException::class, UUIDNotFoundException::class, ForbiddenRoomException::class)
    fun createGameId(roomCode: String, gameIdentity: GameIdentity): GameIdentity{

        if(!roomConfigurationsMap.containsKey(roomCode)){
            throw RoomNotFoundException(roomCode)
        }

        if(!sessionIdService.uuidExists(gameIdentity.uuid)){
            throw UUIDNotFoundException(gameIdentity.uuid)
        }

        if(userBannedFromRoom(gameIdentity.uuid, roomCode)){
            throw ForbiddenRoomException(gameIdentity.uuid, roomCode)
        }

        var id: Long
        val participantsInfo: ConcurrentHashMap<Long, GameIdentity> = roomConfigurationsMap[roomCode]!!.participantsInfo
        do{
            id = Random.nextLong(1, 101)
        }while(participantsInfo.containsKey(id))

        gameIdentity.id = id
        gameIdentity.name = gameIdentity.name.trim()
        gameIdentity.name = alterNameIfDuplicate(roomCode, gameIdentity.name, id)
        gameIdentity.room = roomCode
        gameIdentity.token = jwt.generateJWTForPlayerInRoom(gameIdentity, roomCode)
        roomConfigurationsMap[roomCode]!!.participantsInfo[id] = gameIdentity

        logger.info("registered game identity with uuid of ${gameIdentity.uuid}")
        return gameIdentity

    }

    private fun validateGameSettings(gameSettings: GameSettings): Boolean{

        return gameSettings.players in 3..8
                && gameSettings.seconds in 30..120
                && gameSettings.rounds in 3..10

    }

    @Throws(RoomNotFoundException::class, UserNotFoundException::class)
    fun getUserDetails(roomCode: String, subject: Long): GameIdentity{

        if(!roomConfigurationsMap.containsKey(roomCode)){
            throw RoomNotFoundException(roomCode)
        }

        return roomConfigurationsMap[roomCode]!!.participantsInfo[subject] ?: throw UserNotFoundException()

    }

    fun removeParticipant(roomCode: String, subject: Long){

        roomConfigurationsMap[roomCode]!!.removeParticipant(subject)

    }

    fun disbandRoom(roomCode: String){

        roomConfigurationsMap = ConcurrentHashMap(roomConfigurationsMap.filter { it.key != roomCode })

    }

    fun roomExists(roomCode: String): Boolean{

        return roomConfigurationsMap.containsKey(roomCode)

    }

    fun roomFull(roomCode: String): Boolean{

        if(!roomExists(roomCode)){
            throw RoomNotFoundException(roomCode)
        }

        val roomConfig = roomConfigurationsMap[roomCode]

        return roomConfig!!.participantsInfo.size >= roomConfig.settings.players

    }

    fun roomReady(roomCode: String): Boolean{

        if(!roomExists(roomCode)){
            return false
        }

        val participants = roomConfigurationsMap[roomCode]!!.getParticipantsReadyMap()
                .keys()
                .toList()
        val settings: GameSettings = roomConfigurationsMap[roomCode]!!.settings

        var allReady = true

        for(ready in roomConfigurationsMap[roomCode]!!.getParticipantsReadyMap().values){

            if(!ready){
                allReady = false
                break
            }

        }

        return participants.size == settings.players && allReady
    }

    @Throws(RoomNotFoundException::class)
    fun userBannedFromRoom(uuid: String, roomCode: String): Boolean {

        if(!roomExists(roomCode)){
            throw RoomNotFoundException(roomCode)
        }

        return roomConfigurationsMap[roomCode]!!.bannedUsers.contains(uuid)

    }

    fun alterNameIfDuplicate(roomCode:String, name: String, subject: Long): String{

        val config = roomConfigurationsMap[roomCode] ?: throw RoomNotFoundException(roomCode)

        logger.info("The keys are ${config.nameDuplicates.keys().toList().toMutableList()} " +
                "and contains key is ${config.nameDuplicates.containsKey(name)} and the duplicates are" +
                "${config.nameDuplicates[name]}")

        val names = config.participantsInfo.values.map { it.name }

        if(!names.contains(name)){
            config.nameDuplicates[name] = mutableListOf(subject)
            return name
        }else{

            config.nameDuplicates[name]!!.add(subject)

        }

        var numDupes = config.nameDuplicates[name]!!.size

        var newName = ""
        for(num in 1 until numDupes){
            val proposedName = "$name ($num)"
            if(!names.contains(proposedName)){
                newName = proposedName
                break
            }
        }

        if(newName == ""){
            newName = "$name (${numDupes - 1})"
            newName = alterNameIfDuplicate(roomCode, newName, subject)
        }

        return newName

    }

    @Throws(RoomNotFoundException::class)
    fun banUserFromRoom(subject: Long, roomCode: String){

        if(!roomExists(roomCode)){
            throw RoomNotFoundException(roomCode)
        }
        val uuid = getUserDetails(roomCode, subject).uuid
        roomConfigurationsMap[roomCode]!!.bannedUsers.add(uuid)
        logger.info("Banned user $uuid from room $roomCode")

    }

}