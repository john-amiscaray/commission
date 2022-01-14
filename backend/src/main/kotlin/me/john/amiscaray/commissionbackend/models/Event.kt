package me.john.amiscaray.commissionbackend.models

import java.util.*
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

class Event(val task: Runnable, val startTime: Long, val name: String="unnamed") {

    lateinit var scheduledTask: ScheduledFuture<*>
    var timeLeftOnPause: Long = -1

    fun pauseTask(){

        timeLeftOnPause = scheduledTask.getDelay(TimeUnit.MILLISECONDS)
        scheduledTask.cancel(true)

    }

    fun cancelTask(){

        timeLeftOnPause = -1
        scheduledTask.cancel(true)

    }

    fun getTimeLeft(): Long{

        return scheduledTask.getDelay(TimeUnit.MILLISECONDS)

    }

    override fun toString(): String {
        return "[Event(name=$name|task=$task|startTime=${Date(startTime)})]"
    }

    companion object{

        const val gameEnd: String = "Game end"

    }

}