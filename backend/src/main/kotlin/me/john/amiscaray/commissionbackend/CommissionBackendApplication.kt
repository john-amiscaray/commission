package me.john.amiscaray.commissionbackend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync

@SpringBootApplication
@EnableAsync
class CommissionBackendApplication

fun main(args: Array<String>) {
    runApplication<CommissionBackendApplication>(*args)

}