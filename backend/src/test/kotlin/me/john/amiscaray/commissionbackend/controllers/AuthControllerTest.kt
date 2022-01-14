package me.john.amiscaray.commissionbackend.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.services.LobbyService
import me.john.amiscaray.commissionbackend.services.SessionIdService
import org.junit.jupiter.api.Test

import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.net.URI
import java.util.*

@WebMvcTest
@ContextConfiguration(classes = [SessionIdService::class, AuthController::class])
internal class AuthControllerTest {

    @MockBean
    private lateinit var sessionIdService: SessionIdService

    @MockBean
    private lateinit var lobbyService: LobbyService

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val uuidString = "ddc111ce-0501-11ec-9a03-0242ac130003"
    private val roomCode = "MOON"

    @Test
    fun getSessionId() {

        Mockito.`when`(sessionIdService.generateNewUUID()).thenReturn(UUID.fromString(uuidString))
        mockMvc.get(URI("/sessionId"))
                .andExpect {
                    content {
                        string(uuidString)
                    }
                    status {
                        isOk()
                    }
                }
        Mockito.verify(sessionIdService, Mockito.times(1)).generateNewUUID()

    }

    @Test
    fun revokeSessionId() {

        mockMvc.delete("/sessionId/$uuidString")
                .andExpect {
                    status {
                        isNoContent()
                    }
                }
        Mockito.verify(sessionIdService, Mockito.times(1)).revokeUUID(uuidString)

    }

    @Test
    fun requestGameId() {

        val sampleGameId = GameIdentity(-1, "", uuidString, "Bobbert", "", "")
        val resultGameId = GameIdentity(69, "", uuidString, "Bobbert", "", "fake-jwt")

        Mockito.`when`(lobbyService.createGameId(roomCode, sampleGameId))
                .thenReturn(resultGameId)

        mockMvc.post(URI("/room/$roomCode/game-identity")){
            content = ObjectMapper().writeValueAsString(sampleGameId)
            contentType = MediaType.APPLICATION_JSON
        }.andExpect {
            content {
                json(ObjectMapper().writeValueAsString(resultGameId))
            }
            status {
                isOk()
            }
        }

        Mockito.verify(lobbyService, Mockito.times(1)).createGameId(roomCode, sampleGameId)

    }

    @Test
    fun beaconLogOut() {

        mockMvc.post(URI("/logout-details?uuid=$uuidString"))

        Mockito.verify(sessionIdService, Mockito.times(1)).revokeUUID(uuidString)

    }

}