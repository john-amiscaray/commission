package me.john.amiscaray.commissionbackend.dto

class ServerResponse(val message: String){

    companion object{

        const val ROOM_FULL: String = "Room full."
        const val GAME_STARTED: String = "The game you were looking for has started."
        const val SERVER_ERROR: String = "Something happened with our server, we will try our best to fix it."

    }

}