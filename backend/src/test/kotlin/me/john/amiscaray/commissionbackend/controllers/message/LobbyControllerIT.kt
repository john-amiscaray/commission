package me.john.amiscaray.commissionbackend.controllers.message


import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.dto.lobby.LobbyStatus
import me.john.amiscaray.commissionbackend.services.LobbyService
import me.john.amiscaray.commissionbackend.services.SessionIdService
import org.junit.jupiter.api.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
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

    private var logger: Logger = LoggerFactory.getLogger(LobbyControllerIT::class.java)

    private lateinit var sampleRoomCode: String
    private var sampleGameId = GameIdentity(-1, "", "fake uuid", "Bobbert", "", "")
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
    fun resetFuture(){

        result = CompletableFuture()

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

        assert(response.statusType == LobbyStatus.LobbyStatusType.KICK_PLAYER)

    }

    private fun sendConnectMessageTo(roomCode: String): LobbyStatus {
        val session = stompClient.connect(endpoint, object : StompSessionHandlerAdapter() {})
            .get(1, TimeUnit.SECONDS)

        session.subscribe("$lobbyReceiveEndpoint/$roomCode", getStompFrameHandler())

        val stompHeaders = StompHeaders()

        stompHeaders.destination = "$lobbySendEndpoint/$roomCode"
        stompHeaders.set("token", sampleGameId.token)
        stompHeaders.contentType = MimeType.valueOf("application/json")

        session.send(
            stompHeaders, LobbyStatus(
                statusType = LobbyStatus.LobbyStatusType.CONNECT,
                subject = sampleGameId.id,
                host = sampleGameId.id,
                participants = mutableListOf(),
                settings = settings
            )
        )

        return result.get(1, TimeUnit.SECONDS)
    }

    @Test
    @DisplayName("Expect host id to be the id of the first player who joined")
    fun test2(){

        val response = sendConnectMessageTo(sampleRoomCode)

        assert(response.host == sampleGameId.id)

    }

}