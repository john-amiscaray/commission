package me.john.amiscaray.commissionbackend.services

import me.john.amiscaray.commissionbackend.dto.game.*
import me.john.amiscaray.commissionbackend.exceptions.RoomNotFoundException
import me.john.amiscaray.commissionbackend.exceptions.UserNotFoundException
import me.john.amiscaray.commissionbackend.models.Event
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.stereotype.Service
import java.lang.IllegalArgumentException
import java.util.*
import java.util.concurrent.ConcurrentHashMap

// TODO -> refactor this into multiple classes
@Service
class ActiveGameService(private val messageService: AsyncMessageService, private val sessionIdService: SessionIdService,
                        private val lobby: LobbyService, private val promptService: RandomPromptService,
                        @Qualifier("threadPoolTaskScheduler") private val scheduler: ThreadPoolTaskScheduler) {

    private val logger = LoggerFactory.getLogger(ActiveGameService::class.java)
    private var activeGameStatus: ConcurrentHashMap<String, RoomGameDetails> = ConcurrentHashMap()
    private val activePauseEvents: ConcurrentHashMap<String, Event> = ConcurrentHashMap()
    private val activeRandomWinnerEvent: ConcurrentHashMap<String, Event> = ConcurrentHashMap()
    private val activeRandomPromptEvent: ConcurrentHashMap<String, Event> = ConcurrentHashMap()
    private val DISCONNECT_GRACE_PERIOD: Long = 20 * 1000 // Give 20 seconds for a player to return to a game
    private val PAUSE_EXTENSION_PERIOD: Long = 10 * 1000 // Add an extra 10 seconds to a pause if another player disconnects
    private val JUDGE_SELECTION_TIMEOUT: Long = 120 * 1000 // Allow a judge 2 minutes to pick a winner
    private val PROMPT_SELECT_TIMEOUT: Long = 120 * 1000 // Allow a judge 2 minutes to pick a prompt

    fun registerActiveGame(code: String, participants: Collection<Long>){

        val scoreMap = ConcurrentHashMap<Long, Float>()
        val connectedMap = ConcurrentHashMap<Long, Boolean>()
        for(participant in participants){
            scoreMap[participant] = 500f
            connectedMap[participant] = false
        }
        activeGameStatus[code] = RoomGameDetails(scores=scoreMap, playerConnected=connectedMap)

        logger.info("Registered the room whose id is: $code as an active room")

    }

    fun updateScoreOfPlayer(score: Float, subject: Long, roomCode: String){

        if(activeGameStatus.containsKey(roomCode)){
            activeGameStatus[roomCode]?.scores?.set(key=subject, value=score)
            messageService.sendMessageTo(messageService.getSendGameScoreEndpoint(roomCode), GameScoreUpdate(subject, score))
        }

    }

    /**
     * Increases the player of the given id and room's score by 500, signifying that they won the round
     * @param subject the id of the user
     * @param roomCode the room code of the game
     */
    fun increaseScoreOfPlayer(subject: Long, roomCode: String){

        if(activeGameStatus.containsKey(roomCode)){
            val currentScore: Float = activeGameStatus[roomCode]?.scores?.get(subject) ?: throw UserNotFoundException()
            updateScoreOfPlayer(currentScore + 500, subject, roomCode)
        }

    }

    fun getScoreOfPlayer(roomCode: String, subject: Long): Float?{

        return activeGameStatus[roomCode]?.scores?.get(subject)

    }

    /**
     * Checks if all the players in a room are connected
     * @param roomCode: the room that you wish to examine
     * @return a boolean representing whether or not all the players were connected
     */
    @Throws(RoomNotFoundException::class)
    fun allPlayersConnected(roomCode: String): Boolean{

        if(!activeGameStatus.containsKey(roomCode)){
            throw RoomNotFoundException(roomCode)
        }

        for(playerConnected in activeGameStatus[roomCode]!!.playerConnected.values){

            if(!playerConnected){

                return false

            }

        }
        return true

    }

    @Throws(RoomNotFoundException::class, UserNotFoundException::class)
    fun updateConnectedStatusOfPlayer(connected: Boolean, subject: Long, roomCode: String){

        if(!activeGameStatus.containsKey(roomCode) || activeGameStatus[roomCode] == null){
            throw RoomNotFoundException(roomCode)
        }else if(!activeGameStatus[roomCode]!!.playerConnected.containsKey(subject) ||
                activeGameStatus[roomCode]!!.playerConnected[subject] == null){
            throw UserNotFoundException()
        }else if(activeGameStatus[roomCode]?.scores == null){
            throw Exception("Some serious spaghetti detected")
        }

        val status = activeGameStatus[roomCode]!!

        activeGameStatus[roomCode]?.playerConnected?.set(subject, connected)

        val allConnected = allPlayersConnected(roomCode)

        status.allConnected = allConnected

        if(allConnected && !status.hasStarted){
            val judgeIndex = status.judgeIndex
            val participants = status.playerConnected.keys().toList()
            messageService.sendMessageTo(messageService.getSendGameStatusEndpoint(roomCode),
                    GameStatus(status.scores,
                    -1, GameStatus.GameStatusType.MATCH_START, participants[judgeIndex],
                            status.roundsPlayed
                    ))
            status.hasStarted = true
            prepareRandomPromptSelectEvent(roomCode)
        }

    }

    fun getJudgeOfRoom(roomCode: String): Long{

        if(activeGameStatus[roomCode] == null || !activeGameStatus.containsKey(roomCode)){

            throw RoomNotFoundException(roomCode)

        }

        val roomStatus = activeGameStatus[roomCode]!!

        if(roomStatus.judgeHasLeft){
            return -1
        }

        val participants = roomStatus.playerConnected.keys().toList()
        val judgeIndex = roomStatus.judgeIndex

        return participants[judgeIndex]

    }

    fun gameIsActive(roomCode: String): Boolean{

        return activeGameStatus.containsKey(roomCode)

    }

    fun getRoomGameDetails(roomCode: String): RoomGameDetails {

        return activeGameStatus[roomCode] ?: throw RoomNotFoundException(roomCode)

    }

    /**
     * Tries to start the next round of a game if the room exists and the number of rounds
     * the host configured would allow for this (i.e. if the host choose 10 rounds it will not start an 11th round)
     * @param roomCode The room to prepare the next round for
     * @return a boolean indicating if the action was successful or not
     */
    fun prepareNextRoundIfPossible(roomCode: String): Boolean{

        if(activeGameStatus[roomCode] == null || !activeGameStatus.containsKey(roomCode)){

            throw RoomNotFoundException(roomCode)

        }

        val roomStatus = activeGameStatus[roomCode]!!
        val roomConfigs = lobby.getRoomsConfigurations()
        assert(roomConfigs.containsKey(roomCode))
        val settings = roomConfigs[roomCode]!!.settings

        if(!roomStatus.judgeHasLeft){
            rotateJudge(roomStatus)
        }else{
            roomStatus.judgeHasLeft = false
        }

        if(roomStatus.roundsPlayed < settings.rounds){
            return true
        }

        return false

    }

    private fun rotateJudge(roomStatus: RoomGameDetails) {
        if (roomStatus.judgeIndex < roomStatus.playerConnected.entries.size - 1) {

            roomStatus.judgeIndex++

        } else {
            roomStatus.judgeIndex = 0
            roomStatus.roundsPlayed++
        }
    }

    /**
     * Schedules a game event to happen at the scheduled time, given the room code, the task to run, and the start time.
     * @param roomCode the room that you want to schedule an event for.
     * @param task the runnable you want to run at the given start time.
     * @param startTime the time you want the event to trigger
     */
    fun scheduleTaskForRoom(roomCode: String, task: Runnable, startTime: Long, name: String="unnamed"){

        val room = getRoomGameDetails(roomCode)
        val event = Event(task, startTime, name)

        room.scheduledGameEvents.add(event)

        event.scheduledTask = scheduler.schedule({
            task.run()
            val successful = room.scheduledGameEvents.remove(event)
            logger.info("Attempted to remove $event from the scheduledGameEvents ${if(successful)"successfully"
            else "unsuccessfully"} | It has ${room.scheduledGameEvents.size} events")
        }, Date(event.startTime))

        logger.info("Scheduled $name task for room $roomCode")

    }

    /**
     * Checks if a room is in a paused state or not
     * @param roomCode the room you want to check the paused state of
     * @return a boolean representing the whether or not the room is paused
     */
    fun roomIsPaused(roomCode: String): Boolean{

        return getRoomGameDetails(roomCode).isPaused

    }

    /**
     * Pauses any scheduled game events for the 20 second disconnect grace period. This will be called
     * whenever a player disconnects from the game. When the grace period is over, the game will continue
     * without the player.
     * @param roomCode the room whose game events you wish to pause
     *
     */
    fun pauseTasksForRoomUntilGracePeriod(roomCode: String, disconnectedPlayer: Long){

        getRoomGameDetails(roomCode).isPaused = true

        if(activeRandomWinnerEvent.containsKey(roomCode)){
            logger.info("pausing random winner event for room $roomCode")
            activeRandomWinnerEvent[roomCode]!!.pauseTask()
        }else if(activeRandomPromptEvent.containsKey(roomCode)){
            logger.info("pausing random prompt event for room $roomCode")
            activeRandomPromptEvent[roomCode]!!.pauseTask()
        }
        val events = getRoomGameDetails(roomCode).scheduledGameEvents
        for(event in events){
            event.pauseTask()
            logger.info("Paused ${event.name} task for room $roomCode")
        }

        val pause = if(activePauseEvents.containsKey(roomCode)){
            logger.info("Extending pause for room $roomCode")
            val activePause = activePauseEvents[roomCode]!!
            activePause.pauseTask()
            Event({
                unpauseTasksForRoom(roomCode, true)
            }, System.currentTimeMillis() + PAUSE_EXTENSION_PERIOD + activePause.timeLeftOnPause, "unpause")
        }else{
            Event({
                unpauseTasksForRoom(roomCode, true)
            }, System.currentTimeMillis() + DISCONNECT_GRACE_PERIOD, "pause game")
        }
        activePauseEvents[roomCode] = pause
        pause.scheduledTask = scheduler.schedule(pause.task, Date(pause.startTime))

        logger.info("Paused room with room id: $roomCode")

    }

    /**
     * Unpauses the game events for a room, assuming they were paused in the first place. If this is not the case, then
     * throws an IllegalArgumentException.
     * @param roomCode the room whose game events you wish to unpause
     * @throws IllegalArgumentException
     */
    @Throws(IllegalArgumentException::class)
    fun unpauseTasksForRoom(roomCode: String, playersAreGone: Boolean=false){

        if(!getRoomGameDetails(roomCode).isPaused){
            // TODO -> consider making a custom exception for this
            throw IllegalArgumentException("Cannot unpause tasks for room that is not paused")
        }

        if(activeRandomWinnerEvent.containsKey(roomCode)){
            logger.info("unpausing random winner event for room $roomCode")
            val pausedTask = activeRandomWinnerEvent[roomCode]!!
            val event = Event(pausedTask.task, System.currentTimeMillis() + pausedTask.timeLeftOnPause)
            event.scheduledTask = scheduler.schedule(event.task, Date(event.startTime))
            activeRandomWinnerEvent[roomCode] = event
        }else if(activeRandomPromptEvent.containsKey(roomCode)){
            logger.info("unpausing random prompt event for room $roomCode")
            val pausedTask = activeRandomPromptEvent[roomCode]!!
            val event = Event(pausedTask.task, System.currentTimeMillis() + pausedTask.timeLeftOnPause)
            event.scheduledTask = scheduler.schedule(event.task, Date(event.startTime))
            activeRandomPromptEvent[roomCode] = event
        }
        val temp = getRoomGameDetails(roomCode).scheduledGameEvents.clone() as Stack<Event>
        getRoomGameDetails(roomCode).scheduledGameEvents.clear()
        while(!temp.empty()){
            val event = temp.pop()
            scheduleTaskForRoom(roomCode, event.task,
                    System.currentTimeMillis() + event.timeLeftOnPause, "${event.name} (UNPAUSED)")
            logger.info("${event.name} has ${event.timeLeftOnPause} left")
        }

        val judge = getJudgeOfRoom(roomCode)
        val gameDetails = getRoomGameDetails(roomCode)
        var disconnectedPlayers = mutableListOf<Long>()

        if(playersAreGone){

            disconnectedPlayers = removeAllDisconnectedPlayersOfRoom(roomCode)
            if(!gameDetails.playerConnected.keys().toList().contains(judge)){
                gameDetails.judgeHasLeft = true
            }

        }else{

            if(activePauseEvents.containsKey(roomCode)){
                activePauseEvents[roomCode]!!.scheduledTask.cancel(true)
            }

        }
        messageService.sendMessageTo(
                messageService.getSendGameStatusEndpoint(roomCode),
                PauseStatus(gameDetails.scores, -1, GameStatus.GameStatusType.GAME_UNPAUSE,
                        getJudgeOfRoom(roomCode), gameDetails.roundsPlayed,
                        disconnectedPlayers, playersAreGone))

        getRoomGameDetails(roomCode).isPaused = false

        if(gameDetails.scores.size < 3){
            unregisterActiveRoom(roomCode)
        }
        logger.info("Successfully unpaused all tasks for room $roomCode")


    }

    fun removePlayerFromRoom(roomCode: String, subject: Long){

        val roomDetails = getRoomGameDetails(roomCode)

        roomDetails.playerConnected.remove(subject)
        roomDetails.scores.remove(subject)
        lobby.removeParticipant(roomCode, subject)

    }

    fun unregisterActiveRoom(roomCode: String){

        if(activePauseEvents.containsKey(roomCode)){
            activePauseEvents[roomCode]!!.cancelTask()
            activePauseEvents.remove(roomCode)
        }

        for (scheduledGameEvent in getRoomGameDetails(roomCode).scheduledGameEvents) {
            if(scheduledGameEvent.name != Event.gameEnd){
                scheduledGameEvent.cancelTask()
            }
        }

        activeGameStatus.remove(roomCode)
        activePauseEvents.remove(roomCode)
        lobby.disbandRoom(roomCode)
        logger.info("Disbanded active room of ID: $roomCode")

    }

    @Throws(RoomNotFoundException::class)
    fun scheduleRandomSelectionForRoom(roomCode: String){

        if(gameIsActive(roomCode)){
            val event = Event({
                val judge = getJudgeOfRoom(roomCode)
                val action = JudgeAction(judge,
                        "",
                        JudgeAction.JudgeActionType.JUDGED,
                        getRoomGameDetails(roomCode).playerConnected.keys().toList().filter { it != judge }.random()
                )
                messageService.sendMessageTo(
                        messageService.getJudgeActionsEndpoint(roomCode),
                        action
                )
                tryStartNextRoundOrEndGame(roomCode, getRoomGameDetails(roomCode), action)

            }, System.currentTimeMillis() + JUDGE_SELECTION_TIMEOUT)
            event.scheduledTask = scheduler.schedule(event.task, Date(event.startTime))
            activeRandomWinnerEvent[roomCode] = event
        }else{
            throw RoomNotFoundException(roomCode)
        }

    }

    @Throws(RoomNotFoundException::class)
    fun cancelRandomWinnerForRoomIfExists(roomCode: String){

        if(gameIsActive(roomCode)){
            if(activeRandomWinnerEvent.containsKey(roomCode)){
                val event = activeRandomWinnerEvent[roomCode]
                event!!.scheduledTask.cancel(true)
                activeRandomWinnerEvent.remove(roomCode)
            }
        }else{
            throw RoomNotFoundException(roomCode)
        }

    }

    @Throws(RoomNotFoundException::class)
    fun cancelRandomPromptForRoomIfExists(roomCode: String){

        if(gameIsActive(roomCode)){
            if(activeRandomPromptEvent.containsKey(roomCode)){

                activeRandomPromptEvent[roomCode]!!.scheduledTask.cancel(true)
                activeRandomPromptEvent.remove(roomCode)

            }
        }else{
            throw RoomNotFoundException(roomCode)
        }

    }

    fun tryStartNextRoundOrEndGame(code: String, roomGameDetails: RoomGameDetails, judgeAction: JudgeAction) {
        val canStartRound = prepareNextRoundIfPossible(code)
        val roundStartStatus = GameStatus(roomGameDetails.scores,
                -1, GameStatus.GameStatusType.MATCH_START, getJudgeOfRoom(code),
                roomGameDetails.roundsPlayed)
        val gameOverStatus = GameStatus(roomGameDetails.scores, -1,
                GameStatus.GameStatusType.GAME_END, -1, roomGameDetails.roundsPlayed)
        increaseScoreOfPlayer(judgeAction.winner, code)
        if (canStartRound) {
            scheduleTaskForRoom(code, {
                messageService.sendMessageTo(messageService.getSendGameStatusEndpoint(code),
                        roundStartStatus, onMessageSent = {
                    prepareRandomPromptSelectEvent(code)
                })
            }, System.currentTimeMillis() + 5000, "Match Start")
        } else {
            logger.info("Trying to end the game with ID: $code")
            scheduleTaskForRoom(code, {
                messageService.sendMessageTo(
                        messageService.getSendGameStatusEndpoint(code), gameOverStatus)
                logger.info("Successfully ended game with ID: $code")
            }, System.currentTimeMillis() + 5000, Event.gameEnd)
            lobby.disbandRoom(code)
            unregisterActiveRoom(code)
        }
    }

    private fun prepareRandomPromptSelectEvent(roomCode: String) {
        val event = Event({
            val destination = messageService.getJudgeActionsEndpoint(roomCode)
            val payload = JudgeAction(
                    getJudgeOfRoom(roomCode),
                    promptService.generateRandomPromptForRoomWithSingleName(roomCode),
                    JudgeAction.JudgeActionType.CHOSE_SOMETHING_TO_DRAW
            )
            messageService.sendMessageTo(destination,
                    payload, onMessageSent={ prepareMatchEndForRoom(roomCode) })
        }, System.currentTimeMillis() + PROMPT_SELECT_TIMEOUT)

        event.scheduledTask = scheduler.schedule(event.task, Date(event.startTime))
        activeRandomPromptEvent[roomCode] = event
    }

    @Throws(RoomNotFoundException::class)
    fun prepareMatchEndForRoom(roomCode: String){

        val judge = getJudgeOfRoom(roomCode)
        val roomGameDetails = getRoomGameDetails(roomCode)
        val roomConfig = lobby.getRoomsConfigurations()[roomCode]!!

        scheduleTaskForRoom(roomCode, {
            messageService.sendMessageTo(
                    messageService.getSendGameStatusEndpoint(roomCode), GameStatus(roomGameDetails.scores,
                    -1, GameStatus.GameStatusType.MATCH_END, judge,
                    roomGameDetails.roundsPlayed), onMessageSent = {
                scheduleRandomSelectionForRoom(roomCode)
            })
        }, System.currentTimeMillis() + (roomConfig.settings.seconds * 1000).toLong()
                ,"Match End")

    }

    private fun removeAllDisconnectedPlayersOfRoom(roomCode: String): MutableList<Long>{

        val playerConnectedStatus = ConcurrentHashMap(getRoomGameDetails(roomCode).playerConnected)
        val disconnectedPlayers = mutableListOf<Long>()
        playerConnectedStatus.forEach {
            if (!it.value) {
                val user = lobby.getUserDetails(roomCode, it.key)
                sessionIdService.revokeUUID(user.uuid)
                disconnectedPlayers.add(it.key)
                removePlayerFromRoom(roomCode, it.key)
            }
        }

        return disconnectedPlayers

    }

}