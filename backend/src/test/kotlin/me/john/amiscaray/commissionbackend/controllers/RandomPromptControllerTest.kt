package me.john.amiscaray.commissionbackend.controllers

import me.john.amiscaray.commissionbackend.services.RandomPromptService
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.net.URI

@WebMvcTest
@ContextConfiguration(classes=[RandomPromptController::class, RandomPromptService::class])
@DisplayName("RandomPromptController tests")
internal class RandomPromptControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var randomPromptService: RandomPromptService

    private val roomCode = "MOON"

    @Test
    @DisplayName("When get random prompt for room, expect random prompt and is okay")
    fun getRandomPromptForRoom() {

        val sample = "This is a prompt"

        Mockito.`when`(randomPromptService.generateRandomPromptForRoomWithSingleName(roomCode))
                .thenReturn(sample)

        mockMvc.get(URI("/prompts/for/game/$roomCode/random"))
            .andExpect {
                content {
                    string(sample)
                }
                status {
                    isOk()
                }
            }

    }

}