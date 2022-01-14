package me.john.amiscaray.commissionbackend.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix="app.prop")
class EnvironmentVariables {

    lateinit var secret: String
    lateinit var client: String
    lateinit var test: String

}