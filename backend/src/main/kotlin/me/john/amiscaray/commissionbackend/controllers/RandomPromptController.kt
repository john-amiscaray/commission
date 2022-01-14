package me.john.amiscaray.commissionbackend.controllers

import me.john.amiscaray.commissionbackend.services.RandomPromptService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

@RestController
class RandomPromptController(private val prompt: RandomPromptService) {

    @GetMapping("/prompts/for/game/{roomCode}/random")
    fun getRandomPromptForRoom(@PathVariable("roomCode") roomCode: String): ResponseEntity<String> {

        return ResponseEntity.ok(prompt.generateRandomPromptForRoomWithSingleName(roomCode))

    }

}