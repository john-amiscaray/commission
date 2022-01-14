package me.john.amiscaray.commissionbackend.services

import me.john.amiscaray.commissionbackend.exceptions.UUIDNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import org.springframework.core.env.Environment
import org.springframework.stereotype.Service
import java.util.*

@Service
class SessionIdService(private val environment: Environment) {

    private val existingUUIDs: MutableList<UUID> = mutableListOf()
    private val logger = LoggerFactory.getLogger(ActiveGameService::class.java)

    fun generateNewUUID(): UUID{

        var uuid: UUID
        do{
            uuid = UUID.randomUUID()
        }while(existingUUIDs.contains(uuid))
        existingUUIDs.add(uuid)
        return uuid

    }

    fun uuidExists(stringUuid: String): Boolean{

        val uuid = UUID.fromString(stringUuid)
        return existingUUIDs.contains(uuid)

    }

    @Throws(UUIDNotFoundException::class)
    fun revokeUUID(stringUuid: String){

        if(uuidExists(stringUuid)){
            existingUUIDs.remove(UUID.fromString(stringUuid))
            logger.info("Revoked uuid with value: $stringUuid")
        }else{
            throw UUIDNotFoundException(stringUuid)
        }

    }

    /**
     * Only used for testing purposes. Will throw an exception if in a profile other than test.
     */
    fun getExistingUUIDs(): MutableList<UUID>{

        if(!environment.activeProfiles.contains("test")){
            throw IllegalAccessException("This is only allowed in a test environment")
        }

        return existingUUIDs

    }

}