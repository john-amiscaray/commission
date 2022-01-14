package me.john.amiscaray.commissionbackend.services

import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class AsyncMessageService(private val messenger: SimpMessagingTemplate) {

    private val logger = LoggerFactory.getLogger(AsyncMessageService::class.java)

    fun getSendGameScoreEndpoint(roomCode: String): String{

        return "/game-events/score/$roomCode"

    }

    fun getSendGameStatusEndpoint(roomCode: String): String{

        return "/game-events/status/$roomCode"

    }

    fun getJudgeActionsEndpoint(roomCode: String): String{

        return "/game-events/judge/${roomCode}"

    }

    @Async
    fun sendMessageTo(destination: String, payload: Any, headers: Map<String, Any>? = null,
                      onMessageSent: Runnable = Runnable {  }){

        messenger.convertAndSend(destination, payload, headers)
        onMessageSent.run()
        logger.info("Sent message to $destination")

    }

}