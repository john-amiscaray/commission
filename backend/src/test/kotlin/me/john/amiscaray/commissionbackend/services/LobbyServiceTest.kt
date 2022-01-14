package me.john.amiscaray.commissionbackend.services

import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.dto.lobby.RoomConfiguration
import me.john.amiscaray.commissionbackend.exceptions.InvalidGameSettingsException
import org.junit.jupiter.api.*
import org.mockito.Mockito

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ContextConfiguration
import java.util.concurrent.ConcurrentHashMap

@SpringBootTest
@ContextConfiguration(classes=[LobbyService::class, JWTService::class, SessionIdService::class])
internal class LobbyServiceTest {

    @Autowired
    lateinit var lobbyService: LobbyService

    @MockBean
    lateinit var jwt: JWTService

    @MockBean
    lateinit var sessionIdService: SessionIdService

    private val sampleRoomCode = "MOON"
    private val sampleFullRoom = "FULL"
    private val sampleUUID = "fake-uuid"
    private val sampleIdInFullRoom: Long = 2

    @BeforeEach
    fun setup(){

        lobbyService.getRoomsConfigurations()[sampleRoomCode] = RoomConfiguration(
            settings=GameSettings(5, 60, 5),
            host=420,
            participantsInfo = ConcurrentHashMap(),
            participantsReadyMap = ConcurrentHashMap()
        )

        lobbyService.getRoomsConfigurations()[sampleFullRoom] = RoomConfiguration(
            settings=GameSettings(3, 60, 5),
            host=420,
            participantsInfo=ConcurrentHashMap(
                mapOf(
                    Pair(2, GameIdentity(2, "", sampleUUID,"Bob", sampleFullRoom, "fake-token")),
                    Pair(3, GameIdentity(3, "", sampleUUID,"Bob1", sampleFullRoom, "fake-token")),
                    Pair(4, GameIdentity(4, "", sampleUUID,"Bob2", sampleFullRoom, "fake-token"))
                )
            ),
            participantsReadyMap= ConcurrentHashMap(
                mapOf(
                    Pair(2, true),
                    Pair(3, true),
                    Pair(4, true)
                )
            )
        )

        Mockito.`when`(sessionIdService.uuidExists(Mockito.anyString()))
            .thenReturn(true)

    }

    @Test
    @DisplayName("When generate new room code, return valid room code")
    fun generateNewRoomCode() {

        val result = lobbyService.generateNewRoomCode()
        assert(result.length == 4)
        assert(result.toUpperCase() == result)

    }

    @Nested
    @DisplayName("Register room tests")
    inner class RegisterRoomTests{

        @Test
        @DisplayName("When register room with valid settings, expect room code to be returned and room added to map")
        fun registerRoomTest1() {

            val validSettings = GameSettings(5, 60, 5)
            val result = lobbyService.registerRoom(validSettings)

            assert(result.length == 4)
            assert(result.toUpperCase() == result)
            assert(lobbyService.getRoomsConfigurations().containsKey(result))

        }

        @Test
        @DisplayName("When register room with invalid settings, expect InvalidGameSettingsException")
        fun registerRoomTest2(){

            val invalidSettings = GameSettings(2, 60, 5)

            assertThrows<InvalidGameSettingsException> {

                lobbyService.registerRoom(invalidSettings)

            }

        }

    }

    @Test
    fun createGameId() {

        val sampleRequestBody = GameIdentity(-1, "", "fake uuid", "Bobbert", "", "")
        val fakeJWT = "fake-jwt"

        Mockito.`when`(jwt.generateJWTForPlayerInRoom(sampleRequestBody, sampleRoomCode))
            .thenReturn(fakeJWT)

        val result = lobbyService.createGameId(sampleRoomCode, sampleRequestBody)

        assert(result.name == sampleRequestBody.name)
        assert(result.id != -1L)
        assert(result.room == sampleRoomCode)
        assert(result.token == fakeJWT)

    }

    @Nested
    @DisplayName("Alter name if duplicate tests")
    inner class AlterNameIfDuplicate{

        private val sampleId: Long = 1

        @BeforeEach
        fun setUp(){

            val roomConfig = lobbyService.getRoomsConfigurations()[sampleRoomCode]!!

            val bob = GameIdentity(69, "", "fake-uuid", "Bob", sampleRoomCode, "fake-token")
            val bob1 = GameIdentity(420, "", "fake-uuid", "Bob (1)", sampleRoomCode, "fake-token")

            val jim = GameIdentity(33, "", "fake-uuid", "Jim", sampleRoomCode, "fake-token")

            val larry = GameIdentity(2, "", "fake-uuid", "Larry", sampleRoomCode, "fake-token")
            val larry1 = GameIdentity(3, "", "fake-uuid", "Larry (2)", sampleRoomCode, "fake-token")
            val larry2 = GameIdentity(4, "", "fake-uuid", "Larry (3)", sampleRoomCode, "fake-token")

            val garry = GameIdentity(5, "", "fake-uuid", "Garry (1)", sampleRoomCode, "fake-token")
            val garry1 = GameIdentity(6, "", "fake-uuid", "Garry (2)", sampleRoomCode, "fake-token")
            val garry2 = GameIdentity(7, "", "fake-uuid", "Garry (3)", sampleRoomCode, "fake-token")

            roomConfig.participantsInfo[bob.id] = bob
            roomConfig.participantsInfo[bob1.id] = bob1

            roomConfig.participantsInfo[jim.id] = jim

            roomConfig.participantsInfo[larry.id] = larry
            roomConfig.participantsInfo[larry1.id] = larry1
            roomConfig.participantsInfo[larry2.id] = larry2

            roomConfig.participantsInfo[garry.id] = garry
            roomConfig.participantsInfo[garry1.id] = garry1
            roomConfig.participantsInfo[garry2.id] = garry2

            roomConfig.nameDuplicates[bob.name] = mutableListOf(bob.id, bob1.id)
            roomConfig.nameDuplicates[bob1.name]

            roomConfig.nameDuplicates[jim.name] = mutableListOf(jim.id)

            roomConfig.nameDuplicates[larry.name] = mutableListOf(larry.id, larry1.id, larry2.id)
            roomConfig.nameDuplicates[larry1.name] = mutableListOf(larry1.id)
            roomConfig.nameDuplicates[larry2.name] = mutableListOf(larry2.id)

            roomConfig.nameDuplicates[garry.name] = mutableListOf(garry.id, garry1.id, garry2.id)
            roomConfig.nameDuplicates[garry1.name] = mutableListOf(garry1.id)
            roomConfig.nameDuplicates[garry2.name] = mutableListOf(garry2.id)

        }

        @Test
        @DisplayName("When joining room with non-duplicate name, return argument")
        fun test1(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Bobbert", sampleId)
            assert(result == "Bobbert")

        }

        @Test
        @DisplayName("When joining room with name duplicated twice, append (2) to name")
        fun test2(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Bob", sampleId)
            assert(result == "Bob (2)")

        }

        @Test
        @DisplayName("When joining room with name duplicated once, append (1) to name")
        fun test3(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Jim", sampleId)
            assert(result == "Jim (1)")

        }

        @Test
        @DisplayName("When joining room with name duplicated four times but the second duplicate left, append (1) to name")
        fun test4(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Larry", sampleId)
            assert(result == "Larry (1)")

        }

        @Test
        @DisplayName("When joining room with name duplicate but the original left, return name as is")
        fun test5(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Garry", sampleId)
            assert(result == "Garry")

        }

        @Test
        @DisplayName("When joining room with name duplicate of corrected name, append (1) to name")
        fun test6(){

            val result = lobbyService.alterNameIfDuplicate(sampleRoomCode, "Garry (1)", sampleId)
            assert(result == "Garry (1) (1)")

        }

    }

    @Test
    @DisplayName("When remove participant from room, expect id to not be in the participants info nor the ready map")
    fun removeParticipant() {

        lobbyService.removeParticipant(sampleFullRoom, sampleIdInFullRoom)
        val config = lobbyService.getRoomsConfigurations()[sampleFullRoom]!!

        assert(!config.participantsInfo.containsKey(sampleIdInFullRoom))
        assert(!config.getParticipantsReadyMap().containsKey(sampleIdInFullRoom))

    }

    @Test
    @DisplayName("When disband room, expect room not in room configs map")
    fun disbandRoom() {

        lobbyService.disbandRoom(sampleRoomCode)
        assert(!lobbyService.getRoomsConfigurations().containsKey(sampleRoomCode))

    }

    @Test
    @DisplayName("When checking room is full, expect MOON room to not be full and FULL room to be full")
    fun roomFull() {

        assert(!lobbyService.roomFull(sampleRoomCode))
        assert(lobbyService.roomFull(sampleFullRoom))

    }

    @Test
    @DisplayName("When checking room is ready, expect MOON room to not be ready and FULL room to be ready")
    fun roomReady() {

        assert(!lobbyService.roomReady(sampleRoomCode))
        assert(lobbyService.roomReady(sampleFullRoom))

    }

    @Test
    @DisplayName("When checking uuid is banned, if in bannedUsers list expect true, else false")
    fun userBannedFromRoom() {

        val notBannedUser = "another-fake-uuid"
        lobbyService.getRoomsConfigurations()[sampleRoomCode]!!.bannedUsers.add(sampleUUID)
        assert(lobbyService.userBannedFromRoom(sampleUUID, sampleRoomCode))
        assert(!lobbyService.userBannedFromRoom(notBannedUser, sampleRoomCode))

    }

    @Test
    @DisplayName("When ban user from room, expect their uuid to be in the banned users list")
    fun banUserFromRoom() {

        lobbyService.banUserFromRoom(2, sampleFullRoom)
        assert(lobbyService.getRoomsConfigurations()[sampleFullRoom]!!.bannedUsers.contains(sampleUUID))

    }
}