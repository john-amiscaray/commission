package me.john.amiscaray.commissionbackend.services

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import me.john.amiscaray.commissionbackend.config.EnvironmentVariables
import me.john.amiscaray.commissionbackend.dto.auth.GameIdentity
import org.springframework.stereotype.Service
import java.util.*

@Service
class JWTService(val config: EnvironmentVariables) {

    fun generateJWTForPlayerInRoom(identity: GameIdentity, room: String): String{

        /*
         The longest theoretical game is almost 3 hours -> 8 matches per round x 10 rounds x 2 minutes per match
         -> 160 minutes -> 2 hours and 40 minutes
         */
        val threeHours = 10800000L

        return JWT.create()
                .withSubject(identity.toString())
                .withExpiresAt(Date(System.currentTimeMillis() + threeHours))
                .sign(Algorithm.HMAC512(config.secret.toByteArray()))
    }

    @Throws(JWTVerificationException::class)
    fun verifyJWTForTransaction(token: String, id: Long, room: String): Boolean{

        // Decode the token, verify it and get the subject
        val subject = JWT.require(Algorithm.HMAC512(config.secret.toByteArray()))
                .build()
                .verify(token)
                .subject
        // the subject should be in this form: {id}@{room}
        val data = subject.split("@")

        return id == data[0].toLong() && room == data[1]

    }

}