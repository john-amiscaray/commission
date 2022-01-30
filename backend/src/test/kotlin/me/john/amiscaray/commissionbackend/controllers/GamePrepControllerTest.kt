package me.john.amiscaray.commissionbackend.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import me.john.amiscaray.commissionbackend.dto.game.GameSettings
import me.john.amiscaray.commissionbackend.exceptions.InvalidGameSettingsException
import me.john.amiscaray.commissionbackend.exceptions.RoomNotFoundException
import me.john.amiscaray.commissionbackend.exceptions.UserNotFoundException
import me.john.amiscaray.commissionbackend.services.ActiveGameService
import me.john.amiscaray.commissionbackend.services.LobbyService
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.net.URI

@WebMvcTest
@ContextConfiguration(classes = [GamePrepController::class, LobbyService::class, ActiveGameService::class])
@DisplayName("GamePrepController tests")
internal class GamePrepControllerTest {

    @MockBean
    private lateinit var lobbyService: LobbyService

    @MockBean
    private lateinit var activeGameService: ActiveGameService

    @Autowired
    private lateinit var mockMvc: MockMvc

    private val roomCode: String = "MOON"

    private val id: Long = 69

    private val objectMapper: ObjectMapper = ObjectMapper()


    @Nested
    @DisplayName("Request new game tests")
    inner class RequestNewGameTests{

        @Test
        @DisplayName("When request new game with valid settings, return room code")
        fun requestNewGameTest1() {

            val gameSettings = GameSettings(5, 60, 5)

            Mockito.`when`(lobbyService.registerRoom(gameSettings)).thenReturn(roomCode)

            mockMvc.post(URI("/request-new-game")){
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(gameSettings)
            }.andExpect {
                content {
                    contentType(MediaType.TEXT_PLAIN)
                    string(roomCode)
                }
            }

            Mockito.verify(lobbyService, Mockito.times(1)).registerRoom(gameSettings)


        }

        @Test
        @DisplayName("When request new game with invalid settings, return bad request")
        fun requestNewGameTest2() {

            val gameSettings = GameSettings(2, 60, 5)

            Mockito.`when`(lobbyService.registerRoom(gameSettings)).thenThrow(InvalidGameSettingsException::class.java)

            mockMvc.post(URI("/request-new-game")){
                contentType = MediaType.APPLICATION_JSON
                content = objectMapper.writeValueAsString(gameSettings)
            }.andExpect {
                status{
                    isBadRequest()
                }
            }

            Mockito.verify(lobbyService, Mockito.times(1)).registerRoom(gameSettings)


        }

    }

    @Nested
    @DisplayName("Get Participant Info Tests")
    inner class ParticipantInfoTests{

        @Test
        @DisplayName("When get participant info with room code and id, return participant with that room code and id")
        fun test1() {

            val sample = GameIdentity(id=id, pfp="", uuid="fake", name="Bobbert", room=roomCode, token="also fake")
            Mockito.`when`(lobbyService.getUserDetails(roomCode, id))
                .thenReturn(sample)

            mockMvc.get(URI("/room/$roomCode/player/$id"))
                .andExpect {
                    content {
                        contentType(MediaType.APPLICATION_JSON)
                        json(objectMapper.writeValueAsString(sample.toParticipantInfo()))
                    }
                    status {
                        isOk()
                    }
                }

            Mockito.verify(lobbyService, Mockito.times(1)).getUserDetails(roomCode, id)

        }

        @Test
        @DisplayName("When get participant info with room code and id and user not found, then return 404")
        fun test2() {

            Mockito.`when`(lobbyService.getUserDetails(roomCode, id))
                .thenThrow(UserNotFoundException::class.java)

            mockMvc.get(URI("/room/$roomCode/player/$id"))
                .andExpect {
                    status {
                        isNotFound()
                    }
                }

            Mockito.verify(lobbyService, Mockito.times(1)).getUserDetails(roomCode, id)

        }

        @Test
        @DisplayName("When get participant info with room code and id and room not found, then return 404")
        fun test3() {

            Mockito.`when`(lobbyService.getUserDetails(roomCode, id))
                .thenThrow(RoomNotFoundException::class.java)

            mockMvc.get(URI("/room/$roomCode/player/$id"))
                .andExpect {
                    status {
                        isNotFound()
                    }
                }

            Mockito.verify(lobbyService, Mockito.times(1)).getUserDetails(roomCode, id)

        }

    }

    @Nested
    @DisplayName("Room exists tests")
    inner class RoomExistsTests{

        @Test
        @DisplayName("When checking room exists and room exists and is available, return no content")
        fun doesRoomExistTest1() {

            Mockito.`when`(lobbyService.roomExists(roomCode)).thenReturn(true)
            Mockito.`when`(lobbyService.roomFull(roomCode)).thenReturn(false)
            Mockito.`when`(activeGameService.gameIsActive(roomCode)).thenReturn(false)

            mockMvc.get(URI("/room/$roomCode/exists"))
                    .andExpect {
                        status {
                            isNoContent()
                        }
                    }

        }

        @Test
        @DisplayName("When checking room exists and room does not exist, return 404")
        fun doesRoomExistTest2() {

            Mockito.`when`(lobbyService.roomExists(roomCode)).thenReturn(false)
            Mockito.`when`(lobbyService.roomFull(roomCode)).thenReturn(false)
            Mockito.`when`(activeGameService.gameIsActive(roomCode)).thenReturn(false)

            mockMvc.get(URI("/room/$roomCode/exists"))
                    .andExpect {
                        status {
                            isNotFound()
                        }
                    }

        }

        @Test
        @DisplayName("When checking room exists and room exists but is in game, return conflict")
        fun doesRoomExistTest3() {

            Mockito.`when`(lobbyService.roomExists(roomCode)).thenReturn(true)
            Mockito.`when`(lobbyService.roomFull(roomCode)).thenReturn(true)
            Mockito.`when`(activeGameService.gameIsActive(roomCode)).thenReturn(true)

            mockMvc.get(URI("/room/$roomCode/exists"))
                    .andExpect {
                        status {
                            isConflict()
                        }
                    }

        }

        @Test
        @DisplayName("When checking room exists and room exists but is full, return conflict")
        fun doesRoomExistTest4(){

            Mockito.`when`(lobbyService.roomExists(roomCode)).thenReturn(true)
            Mockito.`when`(lobbyService.roomFull(roomCode)).thenReturn(true)
            Mockito.`when`(activeGameService.gameIsActive(roomCode)).thenReturn(false)

            mockMvc.get(URI("/room/$roomCode/exists"))
                    .andExpect {
                        status {
                            isConflict()
                        }
                    }

        }

    }

}