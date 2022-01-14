package me.john.amiscaray.commissionbackend.dto.lobby

import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import org.slf4j.LoggerFactory
import java.util.concurrent.ConcurrentHashMap

// TODO consider moving this to the models package under a new directory "lobby"
data class RoomConfiguration(val settings: GameSettings,
                             private var participantsReadyMap: ConcurrentHashMap<Long, Boolean>,
                             var host: Long, var participantsInfo: ConcurrentHashMap<Long, GameIdentity>,
                             val nameDuplicates: ConcurrentHashMap<String, MutableList<Long>> = ConcurrentHashMap(),
                             val bannedUsers: MutableList<String> = mutableListOf()) {

    private val logger = LoggerFactory.getLogger(RoomConfiguration::class.java)

    fun removeParticipant(subject: Long){

        val keys = nameDuplicates.keys().toList()

        logger.info(keys.toList().toString())

        for(key in keys){
            val dupes = nameDuplicates[key]!!
            dupes.remove(subject)
            if(dupes.size == 0){
                nameDuplicates.remove(key)
            }
        }
        participantsReadyMap = ConcurrentHashMap(participantsReadyMap.filter { it.key != subject })
        participantsInfo = ConcurrentHashMap(participantsInfo.filter { it.key != subject })

    }

    fun getParticipantsReadyMap(): ConcurrentHashMap<Long, Boolean>{

        return participantsReadyMap

    }

    fun retrieveParticipantsInfo(): ConcurrentHashMap<Long, GameIdentity>{

        return participantsInfo

    }

}