package me.john.amiscaray.commissionbackend.config

import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.messaging.simp.config.MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig(private val config: EnvironmentVariables, private val environment: Environment)
    : WebSocketMessageBrokerConfigurer {

    override fun configureMessageBroker(registry: MessageBrokerRegistry) {

        //receive
        registry.enableSimpleBroker("/game-status", "/game-events")
        //send
        registry.setApplicationDestinationPrefixes("/game")

    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {

        registry.addEndpoint("/stomp")
            .setAllowedOriginPatterns(config.client, config.test)
            .withSockJS()

    }

}