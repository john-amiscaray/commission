package me.john.amiscaray.commissionbackend.controllers.message


import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.dto.lobby.LobbyStatus
import me.john.amiscaray.commissionbackend.services.LobbyService
import me.john.amiscaray.commissionbackend.services.SessionIdService
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.env.Environment
import org.springframework.messaging.converter.MappingJackson2MessageConverter
import org.springframework.messaging.simp.stomp.StompHeaders
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.test.context.ActiveProfiles
import org.springframework.util.MimeType
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import org.springframework.web.socket.sockjs.client.SockJsClient
import org.springframework.web.socket.sockjs.client.WebSocketTransport
import java.lang.Integer.parseInt
import java.lang.reflect.Type
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class LobbyControllerIT {

    @Autowired
    private lateinit var environment: Environment
    private var port: Int? = null
    private lateinit var stompClient: WebSocketStompClient
    private lateinit var endpoint: String
    private var result: CompletableFuture<LobbyStatus> = CompletableFuture()

    private val lobbyReceiveEndpoint = "/game-status/lobby"
    private val lobbySendEndpoint = "/game/lobby"

    @Autowired
    private lateinit var lobbyService: LobbyService
    @Autowired
    private lateinit var sessionIdService: SessionIdService

    private lateinit var sampleRoomCode: String
    private var sampleGameId = GameIdentity(-1, "", "fake uuid", "Test User", "", "")
    private val settings = GameSettings(3, 60, 5)

    @BeforeAll
    fun initTests(){

        port = parseInt(environment.getProperty("server.port"))
        endpoint = "ws://localhost:$port/api/stomp"
        sampleGameId.uuid = sessionIdService.generateNewUUID().toString()
        stompClient = WebSocketStompClient(SockJsClient(
            listOf(WebSocketTransport(StandardWebSocketClient()))
        ))
        stompClient.messageConverter = MappingJackson2MessageConverter()
        sampleRoomCode = lobbyService.registerRoom(settings)
        sampleGameId = lobbyService.createGameId(sampleRoomCode, sampleGameId)

    }

    @AfterEach
    fun postTestCleanUp(){

        result = CompletableFuture()
        // Kick any sample players added to the room and build a new one
        lobbyService.getRoomsConfigurations()[sampleRoomCode]!!.participantsInfo
            .forEach { (_, gameId) -> sendDisconnectMessageTo(sampleRoomCode, gameId) }
        sampleRoomCode = lobbyService.registerRoom(settings)

    }

    fun getStompFrameHandler(): StompSessionHandlerAdapter{

        return object: StompSessionHandlerAdapter() {

            override fun getPayloadType(headers: StompHeaders): Type {

                return LobbyStatus::class.java
            }

            override fun handleFrame(headers: StompHeaders, payload: Any?) {

                result.complete(payload as LobbyStatus)

            }

        }

    }

    @Test
    @DisplayName("When sending message to room that does not exist, send kick player")
    fun test1(){

        val response = sendConnectMessageTo("FAKE")

        assertEquals(response.statusType, LobbyStatus.LobbyStatusType.KICK_PLAYER)
        assertEquals(response.subject, sampleGameId.id)

    }

    private fun sendConnectMessageTo(roomCode: String, player: GameIdentity = sampleGameId): LobbyStatus {
        val session = stompClient.connect(endpoint, object : StompSessionHandlerAdapter() {})
            .get(1, TimeUnit.SECONDS)

        session.subscribe("$lobbyReceiveEndpoint/$roomCode", getStompFrameHandler())

        val stompHeaders = StompHeaders()

        stompHeaders.destination = "$lobbySendEndpoint/$roomCode"
        stompHeaders.set("token", player.token)
        stompHeaders.contentType = MimeType.valueOf("application/json")

        session.send(
            stompHeaders, LobbyStatus(
                statusType = LobbyStatus.LobbyStatusType.CONNECT,
                subject = player.id,
                host = player.id,
                participants = mutableListOf(),
                settings = settings
            )
        )

        return result.get(1, TimeUnit.SECONDS)
    }

    private fun sendDisconnectMessageTo(roomCode: String, player: GameIdentity){

        val session = stompClient.connect(endpoint, object : StompSessionHandlerAdapter() {})
            .get(1, TimeUnit.SECONDS)

        session.subscribe("$lobbyReceiveEndpoint/$roomCode", getStompFrameHandler())

        val stompHeaders = StompHeaders()

        stompHeaders.destination = "$lobbySendEndpoint/$roomCode"
        stompHeaders.set("token", player.token)
        stompHeaders.contentType = MimeType.valueOf("application/json")

        session.send(
            stompHeaders, LobbyStatus(
                statusType = LobbyStatus.LobbyStatusType.DISCONNECT,
                subject = player.id,
                host = player.id,
                participants = mutableListOf(),
                settings = settings
            )
        )

    }

    private fun addNewPlayersToRoom(roomCode: String, nPlayers: Int){

        for(i in 0 until nPlayers){
            var newPlayer = GameIdentity(-1, "", "fake uuid",
                "Bobbert", "", "")
            newPlayer.uuid = sessionIdService.generateNewUUID().toString()
            newPlayer = lobbyService.createGameId(roomCode, newPlayer)
            println(sendConnectMessageTo(roomCode, newPlayer))
        }

    }

    @Test
    @DisplayName("Expect host id to be the id of the first player who joined")
    fun test2(){

        val response = sendConnectMessageTo(sampleRoomCode)

        assertEquals(response.host, sampleGameId.id)

    }

    @Test
    @DisplayName("Expect player to be kicked if room full")
    fun test3(){

        addNewPlayersToRoom(sampleRoomCode, 3)
        val response = sendConnectMessageTo(sampleRoomCode)
        assertTrue(lobbyService.roomFull(sampleRoomCode))
        assertEquals(response.statusType, LobbyStatus.LobbyStatusType.KICK_PLAYER)
        assertEquals(response.subject, sampleGameId.id)

    }

}