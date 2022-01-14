package me.john.amiscaray.commissionbackend.services

import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.env.Environment
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import java.util.*

@SpringBootTest
@ActiveProfiles("test")
@ContextConfiguration(classes = [SessionIdService::class, Environment::class])
internal class SessionIdServiceTest {

    @Autowired
    private lateinit var sessionIdService: SessionIdService

    @Test
    @DisplayName("When generate new uuid, expect a uuid and that uuid to be in the existing uuids list")
    fun generateNewUUID() {

        val uuid = sessionIdService.generateNewUUID()
        assert(sessionIdService.getExistingUUIDs().contains(uuid))

    }

    @Test
    @DisplayName("When checking uuid exists, return true if uuid in existing uuids list, else false")
    fun uuidExists() {

        val sampleUUID = UUID.randomUUID()
        sessionIdService.getExistingUUIDs().add(sampleUUID)
        assert(sessionIdService.uuidExists(sampleUUID.toString()))

        var sampleUnregisteredUUID: UUID

        do{
            sampleUnregisteredUUID = UUID.randomUUID()
        }while(sampleUnregisteredUUID == sampleUUID)

        assert(!sessionIdService.uuidExists(UUID.randomUUID().toString()))

    }

    @Test
    @DisplayName("When revoke uuid, expect uuid to no long be in the existing uuids list")
    fun revokeUUID() {

        val sampleUUID = UUID.randomUUID()
        sessionIdService.getExistingUUIDs().add(sampleUUID)

        sessionIdService.revokeUUID(sampleUUID.toString())

        assert(!sessionIdService.getExistingUUIDs().contains(sampleUUID))

    }
}